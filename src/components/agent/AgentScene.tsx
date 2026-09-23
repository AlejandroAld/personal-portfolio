"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EDGES, NODES, PATH, nodeById, tokenPosition } from "@/lib/agent-graph";
import { getProgress, subscribeProgress } from "@/lib/run-progress";

/**
 * El grafo del agente en WebGL, con la petición viajando por él.
 *
 * Renderiza sólo cuando hace falta (frameloop="demand"): al hacer scroll llega
 * un progreso nuevo, el token se acerca a su destino unos cuadros, y cuando
 * llega el lienzo se queda quieto. Con la pestaña oculta no se pide ningún
 * cuadro. DPR tope 2 (1.5 en móvil), sin luces ni posprocesado: materiales
 * planos, líneas de un píxel, estética de consola.
 *
 * PRESUPUESTO DE BRILLO. El cuerpo de texto (`muted`) tiene que seguir en AAA
 * sobre lo que sea que haya detrás, y eso pone un tope al píxel más claro bajo
 * el texto: rgb(14, 20, 38). Cada cuadro, cada nodo y el token se proyectan a
 * pantalla y se preguntan si están bajo un bloque de contenido (dentro de la
 * columna de texto y a la altura de una sección); si sí, pintan por debajo del
 * tope; si no —el margen derecho en escritorio, los huecos entre secciones en
 * móvil— encienden. Los colores se declaran en sRGB, que es en lo que se mide.
 *
 * El lienzo es OPACO y se limpia con el color de fondo de la página: un lienzo
 * transparente sobre la página deja bordes compuestos más claros que el color
 * que se pintó (alfa premultiplicado + antialias), y ese borde se salía del
 * tope aunque el centro estuviera dentro. Opaco, el píxel es el que se pintó.
 */

// Colores en sRGB: three los convierte a lineal por dentro y el píxel final
// vuelve a ser exactamente esto.
const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
const NODE_DIM = srgb(19, 19, 21);
const NODE_DIM_ACTIVE = srgb(8, 19, 36);
const NODE_LIT = srgb(96, 96, 104);
const NODE_LIT_ACTIVE = srgb(59, 130, 246);
const TOKEN_DIM = srgb(10, 18, 34);
const TOKEN_LIT = srgb(147, 185, 251);
const HALO = srgb(59, 130, 246);
const EDGE = srgb(161, 161, 170);
const EDGE_OPACITY = 0.05; // (161,161,170) al 5 % sobre #0a0a0a ≈ rgb(18,18,18), bajo el tope
const CONTENT_MAX_PX = 64 * 16; // la columna de contenido: max-w-5xl
const CHROME_PX = 84; // barra + marcador

function layout(width: number, height: number, mobile: boolean) {
  const aspect = width / height; // la cámara ve x ∈ [-aspect, aspect], y ∈ [-1, 1]
  return { cx: 0, cy: 0, sx: aspect * (mobile ? 0.9 : 0.94), sy: mobile ? 0.9 : 0.86 };
}

function Graph({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  const { size, invalidate, camera } = useThree();
  const nodes = useMemo(() => NODES.filter((n) => !mobile || n.essential), [mobile]);
  const edges = useMemo(() => EDGES.filter(([a, b]) => nodes.some((n) => n.id === a) && nodes.some((n) => n.id === b)), [nodes]);
  const L = useMemo(() => layout(size.width, size.height, mobile), [size.width, size.height, mobile]);

  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const token = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const target = useRef(getProgress());
  const shown = useRef({ value: target.current.value });
  const zones = useRef<[number, number][]>([]);
  const ready = useRef(false);
  const hidden = useRef(false);

  const toScene = (p: readonly [number, number, number]): [number, number, number] => [L.cx + p[0] * L.sx, L.cy + p[1] * L.sy, p[2] * 0.3];

  const edgeGeometry = useMemo(() => {
    const pts: number[] = [];
    for (const [a, b] of edges) pts.push(...toScene(nodeById(a).p), ...toScene(nodeById(b).p));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, L]);

  // Dónde hay texto: los contenedores de cada sección, en px de pantalla.
  const measureZones = () => {
    zones.current = Array.from(document.querySelectorAll<HTMLElement>("main .max-w-5xl")).map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top, r.bottom];
    });
  };
  const underText = (x: number, y: number, z: number, radiusPx: number): boolean => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    const px = ((v.x + 1) / 2) * size.width;
    const py = ((1 - v.y) / 2) * size.height;
    if (py - radiusPx < CHROME_PX) return true;
    const columnHalf = Math.min(size.width, CONTENT_MAX_PX) / 2;
    const inColumn = Math.abs(px - size.width / 2) - radiusPx < columnHalf;
    if (!inColumn) return false;
    return zones.current.some(([top, bottom]) => py + radiusPx > top && py - radiusPx < bottom);
  };

  useEffect(() => {
    const onVis = () => {
      hidden.current = document.hidden;
      if (!hidden.current) invalidate();
    };
    document.addEventListener("visibilitychange", onVis);
    const unsub = subscribeProgress(() => {
      target.current = getProgress();
      measureZones();
      if (!hidden.current) invalidate();
    });
    measureZones();
    invalidate();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      unsub();
    };
  }, [invalidate]);

  useFrame(() => {
    const goal = target.current.value;
    const diff = goal - shown.current.value;
    if (Math.abs(diff) > 0.0015) {
      shown.current.value += diff * 0.16;
      if (!hidden.current) invalidate();
    } else {
      shown.current.value = goal;
    }
    const v = shown.current.value;
    const step = Math.min(6, Math.max(1, Math.floor(v)));
    const t = v - step;
    const pxPerUnit = size.height / 2;

    const m = nodeMesh.current;
    if (m) {
      const dummy = new THREE.Object3D();
      nodes.forEach((n, i) => {
        const [x, y, z] = toScene(n.p);
        const active = PATH[step - 1] === n.id;
        const s = 0.022 * n.r * (active ? 1.35 : 1);
        dummy.position.set(x, y, z);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        const dim = underText(x, y, z, s * pxPerUnit);
        m.setColorAt(i, dim ? (active ? NODE_DIM_ACTIVE : NODE_DIM) : active ? NODE_LIT_ACTIVE : NODE_LIT);
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    const [tx, ty, tz] = toScene(tokenPosition(step, t));
    if (token.current && halo.current) {
      token.current.position.set(tx, ty, tz + 0.05);
      halo.current.position.set(tx, ty, tz + 0.04);
      const dim = underText(tx, ty, tz, 0.06 * pxPerUnit);
      (token.current.material as THREE.MeshBasicMaterial).color.copy(dim ? TOKEN_DIM : TOKEN_LIT);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = dim ? 0.02 : 0.35;
    }

    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return (
    <>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color={EDGE} transparent opacity={EDGE_OPACITY} toneMapped={false} />
      </lineSegments>
      <instancedMesh ref={nodeMesh} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={halo}>
        <circleGeometry args={[0.06, 24]} />
        <meshBasicMaterial color={HALO} transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={token}>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshBasicMaterial color={TOKEN_LIT} toneMapped={false} />
      </mesh>
    </>
  );
}

export default function AgentScene({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  return (
    <Canvas
      className="stage-canvas"
      orthographic
      camera={{ position: [0, 0, 5], zoom: 1, near: 0.1, far: 20 }}
      frameloop="demand"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: !mobile, alpha: false, powerPreference: "low-power", stencil: false, depth: true }}
      onCreated={({ gl, camera, size }) => {
        // El fondo del lienzo es el de la página, leído del token: nunca dos negros.
        gl.setClearColor(getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#0a0a0a", 1);
        // Cámara ortográfica que ve y ∈ [-1, 1]: las posiciones del grafo son directas.
        const cam = camera as THREE.OrthographicCamera;
        const aspect = size.width / size.height;
        cam.left = -aspect;
        cam.right = aspect;
        cam.top = 1;
        cam.bottom = -1;
        cam.updateProjectionMatrix();
      }}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 200 } }}
    >
      <Graph mobile={mobile} onReady={onReady} />
    </Canvas>
  );
}
