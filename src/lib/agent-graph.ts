/**
 * El grafo del agente: lo que dibuja el escenario 3D y el diagrama SVG.
 *
 * Los nodos son las piezas reales de una corrida de cv-agent, con su archivo y
 * línea en docs/agent-run-map.md. Las posiciones están en un plano
 * normalizado: x e y van de -1 a 1 dentro del área que ocupa el grafo, y z es
 * una profundidad pequeña para que el escenario tenga volumen sin que la
 * cámara tenga que volar.
 *
 * El camino de la petición por pasos es el mismo aquí y en el marcador: el
 * paso N deja el token de la petición en `PATH[N-1]`, y entre pasos viaja por
 * la arista que los une.
 */

export type NodeId =
  | "client"
  | "api"
  | "profile"
  | "context"
  | "model"
  | "tool-search"
  | "tool-detail"
  | "tool-fit"
  | "tool-contact"
  | "reasoning"
  | "output";

export interface GraphNode {
  readonly id: NodeId;
  /** [x, y, z] en el plano normalizado. */
  readonly p: readonly [number, number, number];
  /** Radio relativo: 1 es un nodo principal. */
  readonly r: number;
  /** En móvil sólo se dibujan los esenciales. */
  readonly essential: boolean;
}

// La columna vertebral (petición → API → contexto → modelo → salida) va pegada
// al borde derecho: en escritorio cae en el margen, fuera de la columna de
// texto, y ahí el token de la petición puede encender. Perfil, razonamiento
// y herramientas quedan detrás del contenido, siempre tenues.
export const NODES: readonly GraphNode[] = [
  { id: "client", p: [0.95, 0.9, 0.0], r: 1, essential: true },
  { id: "api", p: [0.95, 0.6, 0.05], r: 0.8, essential: true },
  { id: "profile", p: [0.36, 0.44, -0.15], r: 0.9, essential: true },
  { id: "context", p: [0.95, 0.26, 0.0], r: 1.1, essential: true },
  { id: "model", p: [0.95, -0.14, 0.08], r: 1.2, essential: true },
  { id: "tool-search", p: [0.46, 0.06, -0.1], r: 0.55, essential: true },
  { id: "tool-detail", p: [0.26, -0.18, -0.2], r: 0.5, essential: false },
  { id: "tool-fit", p: [0.34, -0.44, -0.12], r: 0.5, essential: false },
  { id: "tool-contact", p: [0.56, -0.66, -0.22], r: 0.45, essential: false },
  { id: "reasoning", p: [0.58, -0.34, 0.12], r: 0.75, essential: true },
  { id: "output", p: [0.95, -0.58, 0.0], r: 1, essential: true },
];

export const EDGES: readonly (readonly [NodeId, NodeId])[] = [
  ["client", "api"],
  ["api", "context"],
  ["profile", "context"],
  ["context", "model"],
  ["model", "tool-search"],
  ["model", "tool-detail"],
  ["model", "tool-fit"],
  ["model", "tool-contact"],
  ["model", "reasoning"],
  ["model", "output"],
  ["output", "client"],
];

/** Dónde está la petición en cada uno de los seis pasos. */
export const PATH: readonly NodeId[] = ["api", "context", "model", "reasoning", "output", "client"];

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

export const STEPS = 6;

export function nodeById(id: NodeId): GraphNode {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`nodo desconocido: ${id}`);
  return n;
}

/**
 * Posición del token de la petición para un progreso continuo: `step` es el
 * paso actual (1–6) y `t` cuánto de ese paso va recorrido (0–1). Durante el
 * primer tramo de cada paso el token viaja desde el nodo anterior.
 */
export function tokenPosition(step: number, t: number): [number, number, number] {
  const i = Math.min(Math.max(step, 1), STEPS) - 1;
  const to = nodeById(PATH[i]);
  const from = i === 0 ? nodeById("client") : nodeById(PATH[i - 1]);
  const k = Math.min(1, Math.max(0, t) / 0.6); // llega a los 60 % del paso y se queda
  const e = 1 - Math.pow(1 - k, 3);
  return [
    from.p[0] + (to.p[0] - from.p[0]) * e,
    from.p[1] + (to.p[1] - from.p[1]) * e,
    from.p[2] + (to.p[2] - from.p[2]) * e,
  ];
}
