/**
 * El mapa: mi perfil como un agente que se explora con zoom.
 *
 * Ocho nodos con el núcleo al centro. Cada uno lleva su término de agente (el
 * vocabulario del marco, en inglés en los dos idiomas), su slug por idioma
 * (la URL) y dos composiciones hechas a mano: una para pantallas apaisadas y
 * otra para verticales. Las aristas significan algo: el system prompt
 * gobierna a todos, Tools alimenta a Outputs y Training alimenta a Memory.
 * "Bajo el capó" cuelga del núcleo con una arista punteada: explica la página
 * y no es parte del CV.
 *
 * Las posiciones están en unidades de escena. La cámara del mapa mira al
 * origen desde +z, y `mapDistance()` la aleja lo justo para que la
 * composición quepa con margen en la proporción real de la ventana.
 */

export type Locale = "en" | "es";
export type NodeId = "core" | "prompt" | "memory" | "outputs" | "tools" | "training" | "api" | "hood";
export type Vec3 = readonly [number, number, number];

export interface MapNode {
  readonly id: NodeId;
  /** Término de agente, en inglés en los dos idiomas; el núcleo y "bajo el capó" no llevan. */
  readonly agent: string | null;
  readonly slug: Readonly<Record<Locale, string>>;
  readonly landscape: Vec3;
  readonly portrait: Vec3;
  /** Radio relativo: 1 es un nodo normal. */
  readonly r: number;
}

/**
 * "Bajo el capó" sólo existe con las dos corridas del agente grabadas. La
 * bandera la fija next.config.ts al construir, leyendo src/content/runs; sin
 * ella el nodo sale del grafo entero (nodos, aristas, tour, etiquetas, barra,
 * sala y sitemap) y su URL redirige al mapa. El código se queda tal cual.
 */
export const HOOD_AVAILABLE = process.env.NEXT_PUBLIC_HOOD_AVAILABLE === "1";

const ALL_NODES: readonly MapNode[] = [
  { id: "core", agent: null, slug: { es: "", en: "" }, landscape: [0, 0, 0], portrait: [0, -0.95, 0], r: 1.6 },
  { id: "prompt", agent: "System prompt", slug: { es: "quien-soy", en: "who-i-am" }, landscape: [-1.28, 0.76, -0.2], portrait: [-0.62, -0.5, -0.2], r: 1 },
  { id: "memory", agent: "Memory", slug: { es: "memoria", en: "memory" }, landscape: [1.62, 0.15, 0.2], portrait: [0.78, -0.95, 0.2], r: 1.15 },
  { id: "outputs", agent: "Outputs", slug: { es: "proyectos", en: "projects" }, landscape: [1.35, -0.62, -0.15], portrait: [0.6, -1.38, -0.15], r: 1 },
  { id: "tools", agent: "Tools", slug: { es: "stack", en: "stack" }, landscape: [-1.35, -0.62, 0.1], portrait: [-0.6, -1.38, 0.1], r: 1 },
  { id: "training", agent: "Training", slug: { es: "formacion", en: "education" }, landscape: [-1.6, 0.15, -0.3], portrait: [-0.78, -0.95, -0.3], r: 0.95 },
  { id: "api", agent: "API", slug: { es: "contacto", en: "contact" }, landscape: [1.28, 0.76, -0.1], portrait: [0.62, -0.5, -0.1], r: 0.9 },
  { id: "hood", agent: null, slug: { es: "bajo-el-capo", en: "under-the-hood" }, landscape: [0.1, -1.0, -0.4], portrait: [0, -1.72, -0.4], r: 0.8 },
];
export const NODES: readonly MapNode[] = HOOD_AVAILABLE ? ALL_NODES : ALL_NODES.filter((n) => n.id !== "hood");

export type EdgeKind = "hub" | "governs" | "feeds" | "hood";

export interface MapEdge {
  readonly a: NodeId;
  readonly b: NodeId;
  readonly kind: EdgeKind;
}

export const EDGES: readonly MapEdge[] = ([
  // El núcleo conecta con todo lo que es CV.
  { a: "core", b: "prompt", kind: "hub" },
  { a: "core", b: "memory", kind: "hub" },
  { a: "core", b: "outputs", kind: "hub" },
  { a: "core", b: "tools", kind: "hub" },
  { a: "core", b: "training", kind: "hub" },
  { a: "core", b: "api", kind: "hub" },
  // El system prompt gobierna a todos.
  { a: "prompt", b: "memory", kind: "governs" },
  { a: "prompt", b: "outputs", kind: "governs" },
  { a: "prompt", b: "tools", kind: "governs" },
  { a: "prompt", b: "training", kind: "governs" },
  { a: "prompt", b: "api", kind: "governs" },
  // Tools alimenta a Outputs; Training alimenta a Memory.
  { a: "tools", b: "outputs", kind: "feeds" },
  { a: "training", b: "memory", kind: "feeds" },
  // La capa que explica la página cuelga del núcleo, punteada.
  { a: "core", b: "hood", kind: "hood" },
] satisfies readonly MapEdge[]).filter((e) => HOOD_AVAILABLE || e.kind !== "hood");

/** Por qué aristas viajan las partículas, y en qué sentido. */
export const FLOWS: readonly (readonly [NodeId, NodeId])[] = [
  ["prompt", "memory"],
  ["prompt", "outputs"],
  ["prompt", "tools"],
  ["prompt", "training"],
  ["prompt", "api"],
  ["tools", "outputs"],
  ["training", "memory"],
  ["memory", "core"],
  ["outputs", "core"],
  ["core", "api"],
];

export interface SubNode {
  /** El slug dice la función, por idioma; nunca un id del YAML. */
  readonly slug: Readonly<Record<Locale, string>>;
  /** El id en perfil.json, sólo para buscar los datos. */
  readonly ref: string;
}

/** Subnodos: el detalle dentro de un nodo. Sólo Memory por ahora, del más reciente al más antiguo. */
export const SUBNODES: Readonly<Partial<Record<NodeId, readonly SubNode[]>>> = {
  memory: [
    { slug: { es: "agentes-en-produccion", en: "agents-in-production" }, ref: "exp-dalton" },
    { slug: { es: "rag-en-oracle-apex", en: "rag-on-oracle-apex" }, ref: "exp-grupo-ti" },
    { slug: { es: "datos-y-automatizacion", en: "data-and-automation" }, ref: "exp-loreal" },
    { slug: { es: "investigacion-nlp", en: "nlp-research" }, ref: "exp-ipn" },
  ],
};

export interface Stop {
  readonly node: NodeId;
  /** El `ref` del subnodo (id del YAML), no su slug: la URL se arma por idioma. */
  readonly sub: string | null;
}

/** El tour guiado: el orden en que el scroll vuela de nodo en nodo. */
export const TOUR: readonly Stop[] = ([
  { node: "core", sub: null },
  { node: "prompt", sub: null },
  { node: "memory", sub: null },
  { node: "memory", sub: "exp-dalton" },
  { node: "outputs", sub: null },
  { node: "tools", sub: null },
  { node: "training", sub: null },
  { node: "api", sub: null },
  { node: "hood", sub: null },
] satisfies readonly Stop[]).filter((s) => HOOD_AVAILABLE || s.node !== "hood");

/** Los nodos con etiqueta en el mapa, en el orden del tour (el núcleo es el héroe). */
export const LABELED: readonly NodeId[] = (["prompt", "memory", "outputs", "tools", "training", "api", "hood"] as const).filter((id) => HOOD_AVAILABLE || id !== "hood");

export function nodeById(id: NodeId): MapNode {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`nodo desconocido: ${id}`);
  return n;
}

export function nodeBySlug(locale: Locale, slug: string): MapNode | undefined {
  return NODES.find((n) => n.id !== "core" && n.slug[locale] === slug);
}

export function subBySlug(locale: Locale, node: NodeId, slug: string): SubNode | undefined {
  return SUBNODES[node]?.find((s) => s.slug[locale] === slug);
}

export function subByRef(node: NodeId, ref: string): SubNode | undefined {
  return SUBNODES[node]?.find((s) => s.ref === ref);
}

/** "/es/memoria/agentes-en-produccion". `sub` es el ref del subnodo. */
export function pathFor(locale: Locale, node: NodeId | null = null, sub: string | null = null): string {
  if (!node || node === "core") return `/${locale}`;
  const base = `/${locale}/${nodeById(node).slug[locale]}`;
  const s = sub ? subByRef(node, sub) : undefined;
  return s ? `${base}/${s.slug[locale]}` : base;
}

/** La URL del Modo CV: /es/cv, /en/cv. */
export function cvPath(locale: Locale): string {
  return `/${locale}/cv`;
}

/** Lo contrario: de un pathname a (nodo, subnodo); null si no es una ruta del mapa. */
export function parsePath(locale: Locale, pathname: string): Stop | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== locale) return null;
  if (parts.length === 1 || (parts.length === 2 && parts[1] === "cv")) return { node: "core", sub: null };
  const node = nodeBySlug(locale, parts[1]);
  if (!node) return null;
  if (parts.length === 2) return { node: node.id, sub: null };
  const sub = subBySlug(locale, node.id, parts[2]);
  return sub ? { node: node.id, sub: sub.ref } : null;
}

export function stopIndex(node: NodeId | null, sub: string | null): number {
  if (!node || node === "core") return 0;
  const exact = TOUR.findIndex((s) => s.node === node && s.sub === sub);
  if (exact >= 0) return exact;
  return Math.max(0, TOUR.findIndex((s) => s.node === node && s.sub === null));
}

/** Bloques del contexto, en el orden en que `como_contexto()` los arma (core.py:172-297). */
export const CONTEXT_BLOCKS = [
  "Identidad",
  "Contacto público",
  "Resumen",
  "Experiencia",
  "Proyectos",
  "Habilidades",
  "Educación",
  "Publicaciones",
  "Certificaciones",
  "Respuestas preparadas (úsalas casi literales cuando apliquen)",
  "Datos que NO debes revelar",
] as const;

/* ---------------------------------------------------------------------------
   Cámara. Los mismos números en la escena WebGL, en el SVG del servidor y en
   la colocación de las etiquetas antes de que cargue el 3D.
   --------------------------------------------------------------------------- */

export const FOV = 40;
const TAN = Math.tan((FOV / 2) * (Math.PI / 180));

export function isPortrait(aspect: number): boolean {
  return aspect < 0.9;
}

export function positionOf(n: MapNode, portrait: boolean): Vec3 {
  return portrait ? n.portrait : n.landscape;
}

/** Distancia de la cámara del mapa para que la composición quepa con margen. */
export function mapDistance(aspect: number): number {
  const portrait = isPortrait(aspect);
  const pts = NODES.map((n) => positionOf(n, portrait));
  const halfW = Math.max(...pts.map((p) => Math.abs(p[0]))) + (portrait ? 0.38 : 0.5);
  const halfH = Math.max(...pts.map((p) => Math.abs(p[1]))) + (portrait ? 0.62 : 0.28);
  return Math.max(halfW / (TAN * aspect), halfH / TAN);
}

/** El centro del grafo (en vertical está bajo el texto del héroe, no en el origen). */
export function graphCenter(aspect: number): Vec3 {
  const portrait = isPortrait(aspect);
  const pts = NODES.map((n) => positionOf(n, portrait));
  const ys = pts.map((p) => p[1]);
  return [0, (Math.min(...ys) + Math.max(...ys)) / 2, 0];
}

/** A qué distancia se queda la cámara al entrar a un nodo, y al subnodo. */
export const FOCUS = { node: 1.35, sub: 0.95 } as const;

export interface CameraPose {
  readonly position: Vec3;
  readonly target: Vec3;
}

export function mapPose(aspect: number): CameraPose {
  return { position: [0, 0, mapDistance(aspect)], target: [0, 0, 0] };
}

export function focusPose(node: NodeId, level: "node" | "sub", aspect: number): CameraPose {
  const p = positionOf(nodeById(node), isPortrait(aspect));
  const d = FOCUS[level];
  // La cámara entra por la línea que une su puesto en el mapa con el nodo.
  const from = mapPose(aspect).position;
  const dir = [from[0] - p[0], from[1] - p[1], from[2] - p[2]];
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return {
    position: [p[0] + (dir[0] / len) * d, p[1] + (dir[1] / len) * d, p[2] + (dir[2] / len) * d],
    target: p,
  };
}

/**
 * Proyección en perspectiva de un punto a coordenadas normalizadas [-1, 1],
 * con la cámara del mapa (mira a −z desde `position`). Es la misma cuenta
 * que hace three con la misma cámara, para colocar etiquetas y el SVG.
 */
export function projectMap(p: Vec3, aspect: number): { x: number; y: number } {
  const cam = mapPose(aspect).position;
  const dz = cam[2] - p[2];
  return { x: (p[0] - cam[0]) / (dz * TAN * aspect), y: (p[1] - cam[1]) / (dz * TAN) };
}

/* ---------------------------------------------------------------------------
   El tour por scroll: una trayectoria continua por todas las paradas.
   --------------------------------------------------------------------------- */

/** La pose de una parada del tour. */
export function stopPose(i: number, aspect: number): CameraPose {
  const s = TOUR[Math.min(Math.max(0, i), TOUR.length - 1)];
  if (s.node === "core") return mapPose(aspect);
  return focusPose(s.node, s.sub ? "sub" : "node", aspect);
}

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/**
 * La pose de la cámara para un progreso continuo del tour, 0 … TOUR.length-1:
 * Catmull-Rom por las poses de las paradas, así que en cada parada la cámara
 * pasa exactamente por su pose y entre paradas va en curva. El asentamiento
 * suave lo pone `tourEase`, que aplana el progreso cerca de cada parada.
 */
export function tourPose(t: number, aspect: number): CameraPose {
  const n = TOUR.length;
  const clamped = Math.min(Math.max(0, t), n - 1);
  const i = Math.min(n - 2, Math.floor(clamped));
  const u = clamped - i;
  const P = (k: number) => stopPose(Math.min(Math.max(0, k), n - 1), aspect);
  const p0 = P(i - 1);
  const p1 = P(i);
  const p2 = P(i + 1);
  const p3 = P(i + 2);
  const at = (key: "position" | "target", c: 0 | 1 | 2) => catmull(p0[key][c], p1[key][c], p2[key][c], p3[key][c], u);
  return {
    position: [at("position", 0), at("position", 1), at("position", 2)],
    target: [at("target", 0), at("target", 1), at("target", 2)],
  };
}

/**
 * Del avance lineal del scroll al progreso del tour: dentro de cada tramo,
 * una curva que se aplana en los extremos (smootherstep). La cámara se
 * asienta en cada parada sin saltos ni secuestro del scroll: la persona sigue
 * mandando la velocidad.
 */
export function tourEase(linear: number): number {
  const i = Math.floor(linear);
  const u = Math.min(1, Math.max(0, linear - i));
  const v = u * u * u * (u * (u * 6 - 15) + 10);
  return i + v;
}

/** Qué tan cerca de una parada hay que estar para que su sala esté abierta. */
export const STOP_WINDOW = 0.32;
