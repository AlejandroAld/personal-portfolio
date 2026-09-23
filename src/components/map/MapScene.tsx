"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { cubicBezier } from "@/lib/bezier";
import { getExplorer, labelElement, subscribeExplorer, type ExplorerState } from "@/lib/explorer";
import { EDGES, FLOWS, FOV, LABELED, NODES, focusPose, isPortrait, mapPose, nodeById, positionOf, type CameraPose, type NodeId, type Vec3 } from "@/lib/map-graph";
import { EASE_IN_OUT, FLIGHT_MS } from "@/lib/tokens";

/**
 * El mapa en WebGL: el grafo orgánico con el núcleo al centro.
 *
 * Renderiza sólo cuando hace falta (frameloop="demand"): durante un vuelo de
 * cámara, mientras el cursor mueve el paralaje, y —para que las partículas
 * viajen por las aristas— a 20 cuadros por segundo mientras el mapa está a la
 * vista y hubo interacción en los últimos 20 segundos; después se duerme, y
 * con la pestaña oculta o con movimiento reducido no pide ningún cuadro.
 *
 * Entrar a un nodo es un vuelo de 900 ms con la curva de transición (los
 * mismos números que `--ease-in-out`); con movimiento reducido la cámara
 * salta y la sala llega con un fundido del CSS.
 *
 * PRESUPUESTO DE BRILLO, como en la versión anterior: el cuerpo de texto
 * (`muted`) tiene que quedar en AAA sobre lo que haya detrás, y eso pone un
 * tope al píxel más claro bajo un bloque de texto: rgb(14, 20, 38). Cada
 * nodo, anillo y partícula se proyecta a pantalla; si cae bajo el texto del
 * héroe, bajo el panel de una sala o bajo una etiqueta, pinta por debajo del
 * tope. Las aristas van pre-mezcladas con el fondo y siempre por debajo. El
 * lienzo es opaco y se limpia con el color de fondo de la página.
 */

const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
const BG = [10, 10, 10] as const;
/** Un color al `alpha` sobre el fondo, ya mezclado: se dibuja opaco y el píxel es exactamente éste. */
const over = (r: number, g: number, b: number, alpha: number) => srgb(BG[0] + (r - BG[0]) * alpha, BG[1] + (g - BG[1]) * alpha, BG[2] + (b - BG[2]) * alpha);

const NODE_DIM = srgb(19, 19, 21);
const NODE_LIT = srgb(92, 96, 108);
const NODE_ACTIVE = srgb(59, 130, 246);
const NODE_ACTIVE_DIM = srgb(8, 19, 36);
const CORE_LIT = srgb(34, 66, 128);
const CORE_DIM = srgb(8, 19, 36);
const RING_LIT = over(161, 161, 170, 0.3);
const RING_DIM = srgb(16, 16, 17);
const HOOD_LIT = over(161, 161, 170, 0.45);
const HOOD_DIM = srgb(17, 17, 18);
// Todas por debajo del tope bajo texto (L ≤ 0.0085): las aristas cruzan el
// héroe y no se pueden apagar por zonas.
const EDGE_COLOR = { hub: over(161, 161, 170, 0.07), governs: over(59, 130, 246, 0.07), feeds: over(147, 185, 251, 0.06), hood: over(161, 161, 170, 0.075) };
const PARTICLE_LIT = srgb(147, 185, 251);
const PARTICLE_DIM = srgb(10, 18, 34);
const HALO = srgb(59, 130, 246);

const NODE_RADIUS = 0.055;
const IDLE_MS = 20000;
const ease = cubicBezier(...EASE_IN_OUT);

type Rect = { left: number; top: number; right: number; bottom: number };

function poseFor(s: ExplorerState, aspect: number): CameraPose {
  if (s.level === "map" || !s.node) return mapPose(aspect);
  return focusPose(s.node, s.level === "sub" ? "sub" : "node", aspect);
}

function Graph({ onReady }: { onReady: () => void }) {
  const { size, invalidate, camera } = useThree();
  const aspect = size.width / size.height;
  const portrait = isPortrait(aspect);
  const pos = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, positionOf(n, portrait)])) as Record<NodeId, Vec3>, [portrait]);
  const bodies = useMemo(() => NODES.filter((n) => n.id !== "hood"), []);
  const count = portrait ? 60 : 140;

  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const hood = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.LineSegments>(null);
  const points = useRef<THREE.Points>(null);

  const st = useRef<ExplorerState>(getExplorer());
  const zones = useRef<Rect[]>([]);
  const labelSize = useRef<Map<NodeId, [number, number]>>(new Map());
  const hidden = useRef(false);
  const ready = useRef(false);
  const lastInteraction = useRef(performance.now());
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const flight = useRef({ from: mapPose(aspect), to: mapPose(aspect), t0: 0, id: 0 });
  const pose = useRef<{ p: THREE.Vector3; t: THREE.Vector3 }>({ p: new THREE.Vector3(0, 0, mapPose(aspect).position[2]), t: new THREE.Vector3() });
  const lastFrame = useRef(performance.now());

  // Geometría de aristas, pre-mezcladas con el fondo por tipo.
  const edgeGeometry = useMemo(() => {
    const pts: number[] = [];
    const cols: number[] = [];
    for (const e of EDGES) {
      if (e.kind === "hood") continue;
      const a = pos[e.a];
      const b = pos[e.b];
      pts.push(...a, ...b);
      const c = EDGE_COLOR[e.kind];
      cols.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }, [pos]);

  const hoodEdge = useMemo(() => {
    const e = EDGES.find((x) => x.kind === "hood")!;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...pos[e.a], ...pos[e.b]], 3));
    const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: EDGE_COLOR.hood, dashSize: 0.045, gapSize: 0.035, toneMapped: false }));
    line.computeLineDistances();
    return line;
  }, [pos]);

  // Anillos: un círculo por nodo, todos en una sola geometría.
  const SEG = 40;
  const ringGeometry = useMemo(() => {
    const pts: number[] = [];
    for (const n of bodies) {
      const r = NODE_RADIUS * n.r * 1.9;
      const [x, y, z] = pos[n.id];
      for (let i = 0; i < SEG; i++) {
        const a0 = (i / SEG) * Math.PI * 2;
        const a1 = ((i + 1) / SEG) * Math.PI * 2;
        pts.push(x + Math.cos(a0) * r, y + Math.sin(a0) * r, z, x + Math.cos(a1) * r, y + Math.sin(a1) * r, z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Array(pts.length).fill(0), 3));
    return g;
  }, [bodies, pos]);

  // Partículas: cada una viaja por una arista con su fase y su velocidad.
  const particles = useMemo(() => {
    const flow = new Int8Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const jitter = new Float32Array(count * 2);
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      flow[i] = Math.floor(rnd() * FLOWS.length);
      phase[i] = rnd();
      speed[i] = 0.04 + rnd() * 0.07;
      jitter[i * 2] = (rnd() - 0.5) * 0.03;
      jitter[i * 2 + 1] = (rnd() - 0.5) * 0.03;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
    return { flow, phase, speed, jitter, geometry: g };
  }, [count]);

  const measure = () => {
    const s = st.current;
    const rects: Rect[] = [];
    const sel = s.level === "map" ? ".core-inner" : ".room[data-active] .room-inner";
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      const r = el.getBoundingClientRect();
      rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    }
    const chrome = document.querySelector<HTMLElement>(".route")?.getBoundingClientRect().bottom ?? 84;
    rects.push({ left: 0, top: -1, right: size.width, bottom: chrome });
    zones.current = rects;
    for (const id of LABELED) {
      const el = labelElement(id);
      if (el) labelSize.current.set(id, [el.offsetWidth, el.offsetHeight]);
    }
  };

  const v = useMemo(() => new THREE.Vector3(), []);
  const project = (x: number, y: number, z: number) => {
    v.set(x, y, z).project(camera);
    return { px: ((v.x + 1) / 2) * size.width, py: ((1 - v.y) / 2) * size.height, behind: v.z > 1 };
  };
  const labelRects = useRef<Rect[]>([]);
  const underText = (px: number, py: number, radiusPx: number): boolean => {
    const hit = (r: Rect) => px + radiusPx > r.left && px - radiusPx < r.right && py + radiusPx > r.top && py - radiusPx < r.bottom;
    return zones.current.some(hit) || labelRects.current.some(hit);
  };

  useEffect(() => {
    const kick = () => {
      lastInteraction.current = performance.now();
      if (!hidden.current) invalidate();
    };
    const onVis = () => {
      hidden.current = document.hidden;
      if (!hidden.current) kick();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("touchstart", kick, { passive: true });
    window.addEventListener("keydown", kick);
    const unsub = subscribeExplorer(() => {
      const next = getExplorer();
      const prev = st.current;
      st.current = next;
      if (next.flight !== prev.flight || next.mode !== prev.mode) {
        flight.current = { from: { position: [pose.current.p.x, pose.current.p.y, pose.current.p.z], target: [pose.current.t.x, pose.current.t.y, pose.current.t.z] }, to: poseFor(next, size.width / size.height), t0: performance.now(), id: next.flight };
      }
      // La sala tarda un cuadro en tener su tamaño.
      requestAnimationFrame(measure);
      kick();
    });
    st.current = getExplorer();
    pose.current.p.set(...poseFor(st.current, size.width / size.height).position);
    pose.current.t.set(...poseFor(st.current, size.width / size.height).target);
    flight.current = { from: poseFor(st.current, size.width / size.height), to: poseFor(st.current, size.width / size.height), t0: 0, id: st.current.flight };
    measure();
    // Mientras el mapa está a la vista y hay vida, 20 cuadros por segundo para las partículas.
    const tick = window.setInterval(() => {
      const s = st.current;
      if (hidden.current || s.reduced || s.level !== "map" || s.mode !== "explore") return;
      if (performance.now() - lastInteraction.current > IDLE_MS) return;
      invalidate();
    }, 50);
    invalidate();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("keydown", kick);
      window.clearInterval(tick);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidate, size.width, size.height]);

  // Al cambiar el tamaño, la pose objetivo cambia con la proporción.
  useEffect(() => {
    flight.current = { ...flight.current, to: poseFor(st.current, aspect), t0: 0 };
    measure();
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  useFrame(() => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastFrame.current) / 1000);
    lastFrame.current = now;
    const s = st.current;
    let busy = false;

    // Cámara: vuelo entre poses, con paralaje del cursor en reposo.
    const f = flight.current;
    const k = s.reduced || f.t0 === 0 ? 1 : Math.min(1, (now - f.t0) / FLIGHT_MS);
    const e = ease(k);
    const lerp = (a: Vec3, b: Vec3, i: number) => a[i] + (b[i] - a[i]) * e;
    const px = lerp(f.from.position, f.to.position, 0);
    const py = lerp(f.from.position, f.to.position, 1);
    const pz = lerp(f.from.position, f.to.position, 2);
    pose.current.t.set(lerp(f.from.target, f.to.target, 0), lerp(f.from.target, f.to.target, 1), lerp(f.from.target, f.to.target, 2));
    if (k < 1) busy = true;

    const pr = pointer.current;
    const wantParallax = s.level === "map" && !s.reduced && k >= 1;
    const gx = wantParallax ? pr.tx * 0.14 : 0;
    const gy = wantParallax ? -pr.ty * 0.09 : 0;
    pr.x += (gx - pr.x) * 0.08;
    pr.y += (gy - pr.y) * 0.08;
    if (Math.abs(gx - pr.x) > 0.0005 || Math.abs(gy - pr.y) > 0.0005) busy = true;
    pose.current.p.set(px + pr.x, py + pr.y, pz);
    camera.position.copy(pose.current.p);
    camera.lookAt(pose.current.t);

    const pxPerUnit = size.height / (2 * Math.tan((FOV / 2) * (Math.PI / 180)) * Math.max(0.2, camera.position.distanceTo(pose.current.t)));
    const open = s.level !== "map" && s.node;

    // Etiquetas: se colocan con la cámara de este cuadro.
    labelRects.current = [];
    for (const id of LABELED) {
      const el = labelElement(id);
      if (!el) continue;
      const [x, y, z] = pos[id];
      const p = project(x, y, z + 0.02);
      const off = NODE_RADIUS * nodeById(id).r * (portrait ? 2.0 : 2.4) * pxPerUnit;
      const sz = labelSize.current.get(id) ?? [120, 36];
      // En apaisado, los nodos de arriba llevan la etiqueta encima: así no
      // rozan el texto del héroe, que empieza justo debajo.
      const above = !portrait && pos[id][1] > 0.5;
      const lx = p.px;
      const ly = above ? p.py - off - sz[1] : p.py + off;
      const hide = p.behind || lx < -40 || lx > size.width + 40 || ly < -40 || ly > size.height + 40;
      el.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translateX(-50%)`;
      el.dataset.live = "";
      if (hide) el.setAttribute("data-offscreen", "");
      else el.removeAttribute("data-offscreen");
      labelRects.current.push({ left: lx - sz[0] / 2, top: ly, right: lx + sz[0] / 2, bottom: ly + sz[1] });
    }

    // Nodos.
    const m = nodeMesh.current;
    if (m) {
      const dummy = new THREE.Object3D();
      bodies.forEach((n, i) => {
        const [x, y, z] = pos[n.id];
        const active = s.node === n.id;
        const scale = NODE_RADIUS * n.r * (active && open ? 1.6 : 1);
        dummy.position.set(x, y, z);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        const p = project(x, y, z);
        const dim = underText(p.px, p.py, scale * pxPerUnit);
        const color = n.id === "core" ? (dim ? CORE_DIM : CORE_LIT) : active ? (dim ? NODE_ACTIVE_DIM : NODE_ACTIVE) : dim ? NODE_DIM : NODE_LIT;
        m.setColorAt(i, color);
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    // Anillos, con el color de su nodo.
    const rg = rings.current;
    if (rg) {
      const colors = rg.geometry.getAttribute("color") as THREE.BufferAttribute;
      bodies.forEach((n, i) => {
        const [x, y, z] = pos[n.id];
        const r = NODE_RADIUS * n.r * 1.9;
        const p = project(x, y, z);
        const dim = underText(p.px, p.py, r * pxPerUnit);
        const c = dim ? RING_DIM : s.node === n.id ? NODE_ACTIVE_DIM : RING_LIT;
        for (let j = 0; j < SEG * 2; j++) colors.setXYZ(i * SEG * 2 + j, c.r, c.g, c.b);
      });
      colors.needsUpdate = true;
    }

    // Bajo el capó: malla de alambre, colgando del núcleo.
    if (hood.current) {
      const [x, y, z] = pos.hood;
      const p = project(x, y, z);
      const r = NODE_RADIUS * nodeById("hood").r * 1.3;
      hood.current.position.set(x, y, z);
      hood.current.scale.setScalar(r * (s.node === "hood" && open ? 1.6 : 1));
      hood.current.rotation.y += busy ? 0.004 : 0;
      (hood.current.material as THREE.MeshBasicMaterial).color.copy(underText(p.px, p.py, r * pxPerUnit) ? HOOD_DIM : s.node === "hood" ? NODE_ACTIVE_DIM : HOOD_LIT);
    }

    // El halo del nodo abierto: la sala.
    if (halo.current) {
      const target = open ? s.node! : null;
      halo.current.visible = Boolean(target);
      if (target) {
        const [x, y, z] = pos[target];
        halo.current.position.set(x, y, z - 0.02);
        halo.current.lookAt(camera.position);
        const mat = halo.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.06;
        mat.color.copy(HALO);
      }
    }

    // Partículas: avanzan sólo cuando se renderiza, que es cuando hay vida.
    const pt = points.current;
    if (pt) {
      const posAttr = pt.geometry.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = pt.geometry.getAttribute("color") as THREE.BufferAttribute;
      const advance = !s.reduced && s.level === "map" ? dt : 0;
      for (let i = 0; i < count; i++) {
        let u = particles.phase[i] + particles.speed[i] * advance;
        if (u >= 1) u -= 1;
        particles.phase[i] = u;
        const [fa, fb] = FLOWS[particles.flow[i]];
        const a = pos[fa];
        const b = pos[fb];
        const x = a[0] + (b[0] - a[0]) * u + particles.jitter[i * 2];
        const y = a[1] + (b[1] - a[1]) * u + particles.jitter[i * 2 + 1];
        const z = a[2] + (b[2] - a[2]) * u + 0.01;
        posAttr.setXYZ(i, x, y, z);
        const p = project(x, y, z);
        const c = underText(p.px, p.py, 3) ? PARTICLE_DIM : PARTICLE_LIT;
        colAttr.setXYZ(i, c.r, c.g, c.b);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    if (busy && !hidden.current) invalidate();
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return (
    <>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial vertexColors toneMapped={false} />
      </lineSegments>
      <primitive object={hoodEdge} />
      <lineSegments ref={rings} geometry={ringGeometry}>
        <lineBasicMaterial vertexColors toneMapped={false} />
      </lineSegments>
      <instancedMesh ref={nodeMesh} args={[undefined, undefined, bodies.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={hood} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial wireframe toneMapped={false} />
      </mesh>
      <mesh ref={halo} visible={false} frustumCulled={false}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial color={HALO} transparent opacity={0.06} toneMapped={false} depthWrite={false} />
      </mesh>
      <points ref={points} geometry={particles.geometry} frustumCulled={false}>
        <pointsMaterial size={portrait ? 2 : 2.5} sizeAttenuation={false} vertexColors toneMapped={false} />
      </points>
    </>
  );
}

export default function MapScene({ onReady }: { onReady: () => void }) {
  const portrait = typeof window !== "undefined" && window.innerWidth / window.innerHeight < 0.9;
  return (
    <Canvas
      className="stage-canvas"
      camera={{ fov: FOV, near: 0.1, far: 40, position: [0, 0, 3.2] }}
      frameloop="demand"
      dpr={portrait ? [1, 1.5] : [1, 2]}
      gl={{ antialias: !portrait, alpha: false, powerPreference: "low-power", stencil: false, depth: true }}
      onCreated={({ gl }) => {
        // El fondo del lienzo es el de la página, leído del token: nunca dos negros.
        gl.setClearColor(getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#0a0a0a", 1);
      }}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 200 } }}
    >
      <Graph onReady={onReady} />
    </Canvas>
  );
}
