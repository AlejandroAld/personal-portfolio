"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getExplorer, labelElement, setHover, subscribeExplorer, type ExplorerState } from "@/lib/explorer";
import { EDGES, FLOWS, FOV, LABELED, NODES, focusPose, graphCenter, isPortrait, mapDistance, mapPose, nodeById, positionOf, tourPose, type CameraPose, type NodeId, type Vec3 } from "@/lib/map-graph";
import { FALL_MS } from "@/lib/tokens";

/**
 * El mapa en WebGL: el grafo orgánico con el núcleo al centro.
 *
 * La cámara es un resorte críticamente amortiguado sobre posición, objetivo
 * y campo de visión, y se puede reorientar a medio vuelo: si la persona
 * elige otro nodo en pleno vuelo, cambia de destino sin cortes. Entrar a un
 * nodo tiene coreografía: una anticipación de 80 ms (el nodo se ilumina y la
 * cámara retrocede un poco), un vuelo en curva, un leve cierre del campo de
 * visión al llegar, el anillo que se abre como diafragma y las partículas
 * que fluyen hacia el nodo como tokens que entran. El tour por scroll no
 * vuela: arrastra el objetivo del resorte por una trayectoria continua por
 * todas las paradas (`tourPose`).
 *
 * En el umbral la cámara orbita despacio; al elegir explorar, cae a través de
 * la profundidad del grafo con los nodos pasando de largo y las partículas
 * en estela, y se asienta en el mapa.
 *
 * Renderiza mientras hay algo que mover: el umbral, una caída, un resorte
 * sin asentar, el paralaje del cursor, y las partículas mientras el mapa está
 * a la vista. Con la pestaña oculta o con movimiento reducido no pide ningún
 * cuadro que no haga falta. Un solo contexto WebGL.
 *
 * PRESUPUESTO DE BRILLO: el cuerpo de texto (`muted`) tiene que quedar en AAA
 * sobre lo que haya detrás, y eso pone un tope al píxel más claro bajo un
 * bloque de texto: rgb(14, 20, 38). Cada nodo, anillo, tramo de arista y
 * partícula se proyecta a pantalla; si cae bajo el texto del héroe, bajo el
 * panel de una sala o bajo una etiqueta, pinta por debajo del tope. El
 * lienzo es opaco y se limpia con el color de fondo de la página. El sombreado
 * de los nodos escribe sRGB directo, que es en lo que se mide.
 */

const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
const raw = (r: number, g: number, b: number) => new THREE.Vector3(r / 255, g / 255, b / 255);
const BG = [10, 10, 10] as const;
const mix = (r: number, g: number, b: number, alpha: number): [number, number, number] => [BG[0] + (r - BG[0]) * alpha, BG[1] + (g - BG[1]) * alpha, BG[2] + (b - BG[2]) * alpha];
/** Un color al `alpha` sobre el fondo, ya mezclado: se dibuja opaco y el píxel es exactamente éste. */
const over = (r: number, g: number, b: number, alpha: number) => srgb(...mix(r, g, b, alpha));

// Nodos, en sRGB crudo (el sombreado no convierte).
const NODE_DIM = raw(19, 19, 21);
const NODE_LIT = raw(78, 82, 96);
const NODE_ACTIVE = raw(59, 130, 246);
const NODE_ACTIVE_DIM = raw(8, 19, 36);
const CORE_LIT = raw(34, 66, 128);
const CORE_DIM = raw(8, 19, 36);
const ACCENT = raw(59, 130, 246);
// Anillos y aristas, pre-mezclados con el fondo.
const RING_LIT = over(161, 161, 170, 0.3);
const RING_HOT = over(147, 185, 251, 0.55);
const RING_DIM = srgb(16, 16, 17);
const HOOD_LIT = over(161, 161, 170, 0.45);
const HOOD_DIM = srgb(17, 17, 18);
const EDGE_BASE = { hub: mix(161, 161, 170, 0.07), governs: mix(59, 130, 246, 0.07), feeds: mix(147, 185, 251, 0.06), hood: mix(161, 161, 170, 0.075) };
const EDGE_HOT = mix(147, 185, 251, 0.34);
const EDGE_UNDER = mix(161, 161, 170, 0.06);
// Partículas: aditivas. Bajo texto no se atenúan: se apagan del todo, con una
// banda suave antes del borde, porque sumadas a la arista ya atenuada (y entre
// sí, cuando dos estelas se cruzan) cualquier resto se sale del tope.
const PARTICLE_LIT = srgb(120, 160, 236);
const HALO = srgb(59, 130, 246);

const NODE_RADIUS = 0.055;
const EDGE_SEGMENTS = 10;
const TRAIL = 3;

type Rect = { left: number; top: number; right: number; bottom: number };

const GLASS_VERTEX = /* glsl */ `
  attribute vec3 aColor;
  attribute float aLit;
  attribute float aDim;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vColor;
  varying float vLit;
  varying float vDim;
  void main() {
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    vV = normalize(-mv.xyz);
    vColor = aColor;
    vLit = aLit;
    vDim = aDim;
    gl_Position = projectionMatrix * mv;
  }
`;
// Vidrio: borde fresnel en acento, brillo interior, y al encenderse más luz.
// Bajo texto (aDim = 1) pinta plano con su color oscuro: ahí manda el tope.
const GLASS_FRAGMENT = /* glsl */ `
  uniform vec3 uAccent;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vColor;
  varying float vLit;
  varying float vDim;
  void main() {
    float facing = max(dot(normalize(vN), normalize(vV)), 0.0);
    float fresnel = pow(1.0 - facing, 2.6);
    vec3 inner = vColor * (0.62 + 0.38 * pow(facing, 1.6));
    vec3 rim = uAccent * fresnel * (0.55 + 0.9 * vLit);
    vec3 glow = uAccent * 0.28 * vLit * pow(facing, 2.0);
    vec3 lit = inner + rim + glow;
    vec3 c = mix(lit, vColor, vDim);
    gl_FragColor = vec4(c, 1.0);
  }
`;

function poseFor(s: ExplorerState, aspect: number): CameraPose {
  if (s.level === "map" || !s.node) return s.via === "scroll" ? tourPose(s.tour, aspect) : mapPose(aspect);
  if (s.via === "scroll") return tourPose(s.tour, aspect);
  return focusPose(s.node, s.level === "sub" ? "sub" : "node", aspect);
}

function softDisc(size: number, inner: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(255,255,255,${inner})`);
  g.addColorStop(0.35, `rgba(255,255,255,${inner * 0.55})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Resorte críticamente amortiguado (o algo menos, para la caída) sobre un vector. */
function spring(x: THREE.Vector3, v: THREE.Vector3, target: THREE.Vector3, omega: number, zeta: number, dt: number) {
  const ax = -2 * zeta * omega * v.x - omega * omega * (x.x - target.x);
  const ay = -2 * zeta * omega * v.y - omega * omega * (x.y - target.y);
  const az = -2 * zeta * omega * v.z - omega * omega * (x.z - target.z);
  v.x += ax * dt;
  v.y += ay * dt;
  v.z += az * dt;
  x.x += v.x * dt;
  x.y += v.y * dt;
  x.z += v.z * dt;
}
function spring1(x: number, v: number, target: number, omega: number, dt: number): [number, number] {
  const a = -2 * omega * v - omega * omega * (x - target);
  v += a * dt;
  return [x + v * dt, v];
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
  const iris = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.LineSegments>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const points = useRef<THREE.Points>(null);

  const st = useRef<ExplorerState>(getExplorer());
  const zones = useRef<Rect[]>([]);
  const chrome = useRef(84);
  const labelSize = useRef<Map<NodeId, [number, number]>>(new Map());
  const labelRects = useRef<Rect[]>([]);
  const hidden = useRef(false);
  const ready = useRef(false);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0, px: -1, py: -1, mouse: false });
  const sceneHover = useRef<NodeId | null>(null);
  const lastFrame = useRef(performance.now());
  const startedAt = useRef(performance.now());

  // La cámara: resortes.
  const rig = useRef({
    p: new THREE.Vector3(0, 0, mapPose(aspect).position[2]),
    pv: new THREE.Vector3(),
    t: new THREE.Vector3(),
    tv: new THREE.Vector3(),
    fov: FOV,
    fovV: 0,
    flightId: 0,
    flightStart: 0,
    flightDist: 1,
    flightNode: null as NodeId | null,
    fallStart: 0,
    orbit: 0,
    iris: 0,
    irisV: 0,
    sink: 0,
  });

  const tmp = useMemo(() => ({ target: new THREE.Vector3(), look: new THREE.Vector3(), v: new THREE.Vector3(), dir: new THREE.Vector3(), perp: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);

  // Aristas en tramos, con color por vértice: así un tramo bajo texto se apaga
  // aunque el resto de la arista se encienda.
  const edgeGeometry = useMemo(() => {
    const pts: number[] = [];
    for (const e of EDGES) {
      if (e.kind === "hood") continue;
      const a = pos[e.a];
      const b = pos[e.b];
      for (let i = 0; i < EDGE_SEGMENTS; i++) {
        const u0 = i / EDGE_SEGMENTS;
        const u1 = (i + 1) / EDGE_SEGMENTS;
        pts.push(a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0, a[2] + (b[2] - a[2]) * u0, a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1, a[2] + (b[2] - a[2]) * u1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(pts.length), 3));
    return g;
  }, [pos]);
  const edgeList = useMemo(() => EDGES.filter((e) => e.kind !== "hood"), []);

  const hoodEdge = useMemo(() => {
    const e = EDGES.find((x) => x.kind === "hood")!;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...pos[e.a], ...pos[e.b]], 3));
    const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: srgb(...EDGE_BASE.hood), dashSize: 0.045, gapSize: 0.035, toneMapped: false }));
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
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(pts.length), 3));
    return g;
  }, [bodies, pos]);

  // Vidrio: atributos por instancia.
  const glass = useMemo(() => {
    const n = bodies.length;
    const aColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
    const aLit = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
    const aDim = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
    const geometry = new THREE.IcosahedronGeometry(1, 3);
    geometry.setAttribute("aColor", aColor);
    geometry.setAttribute("aLit", aLit);
    geometry.setAttribute("aDim", aDim);
    const material = new THREE.ShaderMaterial({ vertexShader: GLASS_VERTEX, fragmentShader: GLASS_FRAGMENT, uniforms: { uAccent: { value: ACCENT } } });
    return { geometry, material, aColor, aLit, aDim };
  }, [bodies.length]);

  // Partículas: cada una viaja por una arista con su fase y su velocidad, y
  // lleva una estela corta de dos puntos más tenues.
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
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * TRAIL * 3), 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(count * TRAIL * 3), 3));
    return { flow, phase, speed, jitter, geometry: g, texture: softDisc(64, 1) };
  }, [count]);
  const haloTexture = useMemo(() => softDisc(256, 0.09), []);
  // El halo va en la pasada opaca, con su propia mezcla, y se pinta antes que
  // todo: aristas, anillos y nodos quedan encima con su color exacto. En la
  // pasada de transparentes se mezclaría sobre ellos y, bajo texto, una arista
  // ya al tope se salía (rgb(24, 31, 42) medidos sobre el núcleo).
  const haloMaterial = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ map: haloTexture, color: HALO, depthTest: false, depthWrite: false, toneMapped: false });
    m.transparent = false;
    m.blending = THREE.CustomBlending;
    m.blendEquation = THREE.AddEquation;
    m.blendSrc = THREE.SrcAlphaFactor;
    m.blendDst = THREE.OneMinusSrcAlphaFactor;
    return m;
  }, [haloTexture]);

  const measure = () => {
    const s = st.current;
    const rects: Rect[] = [];
    const sel = s.mode === "threshold" ? ".threshold .th-top, .threshold .th-option" : s.level === "map" ? ".core-inner" : ".room[data-active] .room-inner";
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      const r = el.getBoundingClientRect();
      rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    }
    chrome.current = document.querySelector<HTMLElement>(".route")?.getBoundingClientRect().bottom ?? 84;
    if (s.mode !== "threshold") rects.push({ left: 0, top: -1, right: size.width, bottom: chrome.current });
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
  const underText = (px: number, py: number, radiusPx: number): boolean => {
    const hit = (r: Rect) => px + radiusPx > r.left && px - radiusPx < r.right && py + radiusPx > r.top && py - radiusPx < r.bottom;
    return zones.current.some(hit) || labelRects.current.some(hit);
  };
  // Cobertura suave: 0 a `band` px de cualquier zona de texto, 1 en cuanto el
  // sprite (de radio `radiusPx`) toca el rectángulo. Las esquinas van redondas.
  const textCover = (px: number, py: number, radiusPx: number, band: number): number => {
    let k = 0;
    const test = (r: Rect) => {
      const dx = Math.max(r.left - px, px - r.right, 0);
      const dy = Math.max(r.top - py, py - r.bottom, 0);
      const d = Math.hypot(dx, dy) - radiusPx;
      if (d < band) k = Math.max(k, 1 - Math.max(0, d) / band);
    };
    for (const r of zones.current) test(r);
    for (const r of labelRects.current) test(r);
    return k;
  };

  useEffect(() => {
    const kick = () => {
      if (!hidden.current) invalidate();
    };
    const onVis = () => {
      hidden.current = document.hidden;
      if (!hidden.current) kick();
    };
    const onPointer = (e: PointerEvent) => {
      const pr = pointer.current;
      pr.mouse = e.pointerType === "mouse";
      pr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pr.ty = (e.clientY / window.innerHeight) * 2 - 1;
      pr.px = e.clientX;
      pr.py = e.clientY;
      kick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    const unsub = subscribeExplorer(() => {
      const next = getExplorer();
      const prev = st.current;
      st.current = next;
      const r = rig.current;
      if (next.flight !== prev.flight) {
        r.flightId = next.flight;
        r.flightStart = performance.now();
        r.flightNode = next.level !== "map" ? next.node : null;
        const to = poseFor(next, size.width / size.height);
        r.flightDist = Math.max(0.001, r.p.distanceTo(new THREE.Vector3(...to.position)));
        if (next.level !== "map" && next.via === "click") r.sink = 1;
      }
      if (next.falling && !prev.falling) r.fallStart = performance.now();
      // La sala tarda un cuadro en tener su tamaño.
      requestAnimationFrame(measure);
      kick();
    });
    st.current = getExplorer();
    const first = poseFor(st.current, size.width / size.height);
    rig.current.p.set(...first.position);
    rig.current.t.set(...first.target);
    if (st.current.mode === "threshold") rig.current.p.set(0, 0.3, mapDistance(size.width / size.height) * 1.15);
    measure();
    invalidate();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", kick);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidate, size.width, size.height]);

  useEffect(() => {
    measure();
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  useFrame(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
    lastFrame.current = now;
    const s = st.current;
    const r = rig.current;
    const cam = camera as THREE.PerspectiveCamera;
    let busy = false;
    const open = s.level !== "map" && s.node ? s.node : null;
    const threshold = s.mode === "threshold";
    const falling = s.falling === "explore";

    // ---- La cámara ---------------------------------------------------------
    let omega = 10;
    let zeta = 1;
    let fovTarget = FOV;
    if (threshold && !falling) {
      // Órbita lenta alrededor del grafo. En vertical la previsualización sólo
      // muestra la parte alta del lienzo, así que el grafo se sube al centro
      // de lo visible.
      r.orbit += dt * 0.09;
      const R = mapDistance(aspect) * (portrait ? 0.95 : 1.18);
      const gc = graphCenter(aspect);
      const lookY = portrait ? gc[1] - 0.75 : 0;
      tmp.target.set(Math.sin(r.orbit) * R * 0.55, lookY + 0.25 + Math.sin(r.orbit * 0.6) * 0.18, Math.cos(r.orbit) * R);
      tmp.look.set(0, lookY, 0);
      omega = 6;
      busy = !s.reduced;
    } else if (falling) {
      // La caída: a través del grafo, con impulso, y se asienta en el mapa.
      const p = mapPose(aspect);
      tmp.target.set(p.position[0], p.position[1], p.position[2]);
      tmp.look.set(0, 0, 0);
      const k = Math.min(1, (now - r.fallStart) / FALL_MS);
      if (k < 0.05 && r.pv.z > -3) r.pv.set(pointer.current.tx * 0.6, -pointer.current.ty * 0.4, -7.5);
      omega = 7;
      zeta = 0.68;
      fovTarget = FOV + 10 * (1 - k);
      busy = true;
    } else {
      const pose = poseFor(s, aspect);
      tmp.target.set(pose.position[0], pose.position[1], pose.position[2]);
      tmp.look.set(pose.target[0], pose.target[1], pose.target[2]);
      if (open && s.via === "click") {
        const since = now - r.flightStart;
        const dist = r.p.distanceTo(tmp.target);
        const progress = 1 - Math.min(1, dist / r.flightDist);
        if (since < 80) {
          // Anticipación: la cámara retrocede un poco antes de volar.
          tmp.dir.subVectors(r.p, tmp.look).normalize();
          tmp.target.copy(r.p).addScaledVector(tmp.dir, 0.12);
          omega = 14;
        } else {
          // Vuelo en curva: un desvío perpendicular que crece y se apaga.
          tmp.dir.subVectors(tmp.target, r.p);
          tmp.perp.crossVectors(tmp.dir, tmp.up).normalize();
          const arc = Math.sin(Math.PI * progress) * 0.28 * Math.min(1, r.flightDist / 2);
          tmp.target.addScaledVector(tmp.perp, arc).y += Math.sin(Math.PI * progress) * 0.12;
          omega = 9;
        }
        fovTarget = s.level === "sub" ? 34 : 36;
      } else if (open) {
        fovTarget = s.level === "sub" ? 35 : 37;
        omega = 8;
      } else if (s.via === "scroll") {
        omega = 12;
      }
      // Paralaje en reposo, sólo con ratón y sólo en el mapa.
      const pr = pointer.current;
      const wantParallax = !open && !s.reduced && pr.mouse;
      const gx = wantParallax ? pr.tx * 0.12 : 0;
      const gy = wantParallax ? -pr.ty * 0.08 : 0;
      pr.x += (gx - pr.x) * 0.08;
      pr.y += (gy - pr.y) * 0.08;
      if (Math.abs(gx - pr.x) > 0.0005 || Math.abs(gy - pr.y) > 0.0005) busy = true;
      tmp.target.x += pr.x;
      tmp.target.y += pr.y;
    }
    if (s.reduced && !threshold) {
      r.p.copy(tmp.target);
      r.t.copy(tmp.look);
      r.pv.set(0, 0, 0);
      r.tv.set(0, 0, 0);
      r.fov = fovTarget;
    } else {
      spring(r.p, r.pv, tmp.target, omega, zeta, dt);
      spring(r.t, r.tv, tmp.look, omega, zeta, dt);
      [r.fov, r.fovV] = spring1(r.fov, r.fovV, fovTarget, 8, dt);
      const settled = r.pv.lengthSq() < 1e-6 && r.p.distanceToSquared(tmp.target) < 1e-6 && r.tv.lengthSq() < 1e-6 && Math.abs(r.fovV) < 1e-4;
      if (!settled) busy = true;
    }
    cam.position.copy(r.p);
    cam.lookAt(r.t);
    if (Math.abs(cam.fov - r.fov) > 0.01) {
      cam.fov = r.fov;
      cam.updateProjectionMatrix();
    }
    const pxPerUnit = size.height / (2 * Math.tan((cam.fov / 2) * (Math.PI / 180)) * Math.max(0.2, cam.position.distanceTo(r.t)));
    const speed = r.pv.length();

    // ---- Hover sobre la esfera (el ratón toca el nodo, no sólo la etiqueta) --
    if (!open && !threshold && pointer.current.mouse) {
      let found: NodeId | null = null;
      for (const id of LABELED) {
        const [x, y, z] = pos[id];
        const p = project(x, y, z);
        const rad = NODE_RADIUS * nodeById(id).r * pxPerUnit * 1.7;
        if (Math.hypot(p.px - pointer.current.px, p.py - pointer.current.py) < rad) found = id;
      }
      if (found !== sceneHover.current) {
        if (found) setHover(found);
        else if (sceneHover.current && s.hover === sceneHover.current) setHover(null);
        sceneHover.current = found;
      }
    }
    const hot = s.hover && LABELED.includes(s.hover) ? s.hover : null;

    // ---- Etiquetas: se colocan con la cámara de este cuadro ----------------
    labelRects.current = [];
    for (const id of LABELED) {
      const el = labelElement(id);
      if (!el) continue;
      const [x, y, z] = pos[id];
      const p = project(x, y, z + 0.02);
      const off = NODE_RADIUS * nodeById(id).r * (portrait ? 2.0 : 2.4) * pxPerUnit;
      const sz = labelSize.current.get(id) ?? [120, 36];
      // En apaisado, los nodos de arriba llevan la etiqueta encima, salvo que
      // no quepa bajo la barra: entonces va debajo. Margen seguro: 8 px.
      // En vertical, "bajo el capó" lleva la etiqueta encima: abajo está el interruptor.
      let above = (!portrait && pos[id][1] > 0.5) || (portrait && id === "hood");
      let ly = above ? p.py - off - sz[1] : p.py + off;
      if (above && ly < chrome.current + 8) {
        above = false;
        ly = p.py + off;
      }
      if (!above && ly < chrome.current + 8) ly = chrome.current + 8;
      const lx = p.px;
      const hide = p.behind || threshold || lx < -40 || lx > size.width + 40 || ly < -40 || ly > size.height + 40;
      el.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translateX(-50%)`;
      el.dataset.live = "";
      if (hide) el.setAttribute("data-offscreen", "");
      else el.removeAttribute("data-offscreen");
      labelRects.current.push({ left: lx - sz[0] / 2, top: ly, right: lx + sz[0] / 2, bottom: ly + sz[1] });
    }

    // ---- Nodos de vidrio ---------------------------------------------------
    const m = nodeMesh.current;
    if (m) {
      const dummy = new THREE.Object3D();
      bodies.forEach((n, i) => {
        const [x, y, z] = pos[n.id];
        const isOpen = open === n.id;
        const isHot = hot === n.id;
        const anticipating = isOpen && now - r.flightStart < 80;
        const scale = NODE_RADIUS * n.r * (isOpen ? 1.55 : isHot ? 1.12 : 1) * (anticipating ? 1.08 : 1);
        dummy.position.set(x, y, z);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        const p = project(x, y, z);
        const dim = !threshold && underText(p.px, p.py, scale * pxPerUnit * 1.15);
        const c = n.id === "core" ? (dim ? CORE_DIM : CORE_LIT) : isOpen ? (dim ? NODE_ACTIVE_DIM : NODE_ACTIVE) : dim ? NODE_DIM : NODE_LIT;
        glass.aColor.setXYZ(i, c.x, c.y, c.z);
        glass.aLit.setX(i, isOpen ? 1 : isHot ? 0.8 : 0);
        glass.aDim.setX(i, dim ? 1 : 0);
      });
      m.instanceMatrix.needsUpdate = true;
      glass.aColor.needsUpdate = true;
      glass.aLit.needsUpdate = true;
      glass.aDim.needsUpdate = true;
    }

    // ---- Anillos -----------------------------------------------------------
    const rg = rings.current;
    if (rg) {
      const colors = rg.geometry.getAttribute("color") as THREE.BufferAttribute;
      bodies.forEach((n, i) => {
        const [x, y, z] = pos[n.id];
        const rr = NODE_RADIUS * n.r * 1.9;
        const p = project(x, y, z);
        const dim = !threshold && underText(p.px, p.py, rr * pxPerUnit);
        const c = dim ? RING_DIM : hot === n.id || open === n.id ? RING_HOT : RING_LIT;
        for (let j = 0; j < SEG * 2; j++) colors.setXYZ(i * SEG * 2 + j, c.r, c.g, c.b);
      });
      colors.needsUpdate = true;
    }

    // ---- Aristas por tramos: se encienden las del nodo bajo el cursor o abierto,
    //      tramo por tramo, nunca bajo texto ---------------------------------
    const eg = edgesRef.current;
    if (eg) {
      const colors = eg.geometry.getAttribute("color") as THREE.BufferAttribute;
      const posAttr = eg.geometry.getAttribute("position") as THREE.BufferAttribute;
      const lit = hot ?? open;
      let k = 0;
      for (const e of edgeList) {
        const base = EDGE_BASE[e.kind];
        const isLit = lit !== null && (e.a === lit || e.b === lit);
        for (let i = 0; i < EDGE_SEGMENTS; i++) {
          for (let j = 0; j < 2; j++) {
            const idx = k * 2 + j;
            const x = posAttr.getX(idx);
            const y = posAttr.getY(idx);
            const z = posAttr.getZ(idx);
            let c = base;
            if (isLit) {
              const p = project(x, y, z);
              c = !threshold && underText(p.px, p.py, 2) ? EDGE_UNDER : EDGE_HOT;
            }
            const col = srgb(c[0], c[1], c[2]);
            colors.setXYZ(idx, col.r, col.g, col.b);
          }
          k++;
        }
      }
      colors.needsUpdate = true;
    }

    // ---- Bajo el capó: malla de alambre, colgando del núcleo ---------------
    if (hood.current) {
      const [x, y, z] = pos.hood;
      const p = project(x, y, z);
      const rr = NODE_RADIUS * nodeById("hood").r * 1.3;
      hood.current.position.set(x, y, z);
      hood.current.scale.setScalar(rr * (open === "hood" ? 1.6 : hot === "hood" ? 1.1 : 1));
      hood.current.rotation.y += busy ? 0.004 : 0;
      const dim = !threshold && underText(p.px, p.py, rr * pxPerUnit);
      (hood.current.material as THREE.MeshBasicMaterial).color.copy(dim ? HOOD_DIM : open === "hood" || hot === "hood" ? RING_HOT : HOOD_LIT);
    }

    // ---- El diafragma: el anillo del nodo abierto se abre hasta ser el marco de la sala
    if (iris.current) {
      const target = open ?? null;
      const wantR = target ? (s.level === "sub" ? 0.5 : 0.62) : 0.06;
      [r.iris, r.irisV] = spring1(r.iris, r.irisV, wantR, 9, dt);
      if (Math.abs(r.irisV) > 1e-4) busy = true;
      iris.current.visible = Boolean(target) || r.iris > 0.07;
      if (iris.current.visible) {
        const id = target ?? r.flightNode ?? "core";
        const [x, y, z] = pos[id];
        iris.current.position.set(x, y, z + 0.01);
        iris.current.lookAt(cam.position);
        iris.current.scale.setScalar(r.iris / 0.62);
        (iris.current.material as THREE.MeshBasicMaterial).opacity = target ? 0.16 : 0.08;
      }
    }

    // ---- El halo del núcleo: el origen, del que salen las aristas ----------
    if (halo.current) {
      const [x, y, z] = pos.core;
      halo.current.position.set(x, y, z - 0.06);
      halo.current.lookAt(cam.position);
      halo.current.visible = !open;
    }

    // ---- Partículas: redondas, aditivas, con estela; fluyen hacia el nodo al entrar
    const pt = points.current;
    if (pt) {
      const posAttr = pt.geometry.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = pt.geometry.getAttribute("color") as THREE.BufferAttribute;
      const alive = !s.reduced && !hidden.current;
      const advance = alive ? dt * (falling ? 3 : 1) : 0;
      if (r.sink > 0) {
        r.sink = Math.max(0, r.sink - dt / 0.9);
        busy = true;
      }
      const sinkK = open && r.sink > 0 ? Math.sin(Math.PI * Math.min(1, 1 - r.sink)) * 0.85 : 0;
      const sinkTo = open ? pos[open] : pos.core;
      const trail = 0.012 * (1 + Math.min(4, speed * 0.6));
      for (let i = 0; i < count; i++) {
        let u = particles.phase[i] + particles.speed[i] * advance;
        if (u >= 1) u -= 1;
        particles.phase[i] = u;
        const [fa, fb] = FLOWS[particles.flow[i]];
        const a = pos[fa];
        const b = pos[fb];
        for (let t = 0; t < TRAIL; t++) {
          const uu = Math.max(0, u - t * trail);
          let x = a[0] + (b[0] - a[0]) * uu + particles.jitter[i * 2];
          let y = a[1] + (b[1] - a[1]) * uu + particles.jitter[i * 2 + 1];
          let z = a[2] + (b[2] - a[2]) * uu + 0.01;
          if (sinkK > 0) {
            x += (sinkTo[0] - x) * sinkK;
            y += (sinkTo[1] - y) * sinkK;
            z += (sinkTo[2] + 0.03 - z) * sinkK;
          }
          const idx = i * TRAIL + t;
          posAttr.setXYZ(idx, x, y, z);
          const p = project(x, y, z);
          // El sprite mide 9 px y es suave: el radio de prueba es el suyo. Se
          // apaga al acercarse a texto, y aditivo a cero no suma nada.
          const cover = threshold ? 0 : textCover(p.px, p.py, portrait ? 5 : 6, portrait ? 20 : 28);
          const f = (t === 0 ? 1 : t === 1 ? 0.45 : 0.2) * (1 - cover);
          colAttr.setXYZ(idx, PARTICLE_LIT.r * f, PARTICLE_LIT.g * f, PARTICLE_LIT.b * f);
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      // Mientras el mapa está a la vista, las partículas siguen: no se duermen.
      if (alive && !open) busy = true;
    }

    if (busy && !hidden.current) invalidate();
    if (!ready.current) {
      ready.current = true;
      startedAt.current = now;
      onReady();
    }
  });

  return (
    <>
      <mesh ref={halo} material={haloMaterial} renderOrder={-1} frustumCulled={false}>
        <planeGeometry args={[2.6, 2.6]} />
      </mesh>
      <lineSegments ref={edgesRef} geometry={edgeGeometry}>
        <lineBasicMaterial vertexColors toneMapped={false} />
      </lineSegments>
      <primitive object={hoodEdge} />
      <lineSegments ref={rings} geometry={ringGeometry}>
        <lineBasicMaterial vertexColors toneMapped={false} />
      </lineSegments>
      <instancedMesh ref={nodeMesh} args={[glass.geometry, glass.material, bodies.length]} frustumCulled={false} />
      <mesh ref={hood} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial wireframe toneMapped={false} />
      </mesh>
      <mesh ref={iris} visible={false} frustumCulled={false}>
        <ringGeometry args={[0.6, 0.62, 96]} />
        <meshBasicMaterial color={srgb(59, 130, 246)} transparent opacity={0.16} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <points ref={points} geometry={particles.geometry} frustumCulled={false}>
        <pointsMaterial map={particles.texture} size={portrait ? 7 : 9} sizeAttenuation={false} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
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
      // offsetSize: el tamaño del lienzo se mide sin transformaciones CSS. En el
      // umbral el escenario entero va escalado al 44 %, y medirlo con
      // getBoundingClientRect dejaba un lienzo pequeño en la esquina.
      resize={{ scroll: false, offsetSize: true, debounce: { scroll: 50, resize: 200 } }}
    >
      <Graph onReady={onReady} />
    </Canvas>
  );
}
