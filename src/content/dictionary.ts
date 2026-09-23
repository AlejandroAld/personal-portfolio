/**
 * La forma del contenido del sitio.
 *
 * El reparto es deliberado:
 *
 *   perfil.json  →  los HECHOS estructurales: fechas, empresas, puestos,
 *                   stacks, habilidades, estudios, publicación. Nunca se
 *                   reescriben a mano; salen de perfil.yaml.
 *   Dictionary   →  la PROSA: posicionamiento, encabezados, el titular de
 *                   cada puesto, los proyectos, y las traducciones.
 *
 * Así una fecha mal puesta se arregla en el YAML y se corrige en los dos
 * idiomas a la vez, y ningún dato vive en dos lugares.
 */

import type { CiteKey } from "@/lib/evidence";
import type { NodeId } from "@/lib/map-graph";

export type Locale = "en" | "es";

/** Un número de la tira. TODOS salen de perfil.yaml: ninguno se inventa. */
export interface Metric {
  /** El estado final, ya renderizado en el servidor. Existe sin JS. */
  readonly value: string;
  readonly countTo?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly label: string;
  /** De dónde viene: empresa o proyecto. Da contexto sin inflar el número. */
  readonly context: string;
  readonly cite: CiteKey;
}

/** Prosa de un puesto, indexada por el id de perfil.json. */
export interface RoleCopy {
  /**
   * El titular. Cuando el puesto tiene métrica, va la MÉTRICA, no el nombre
   * del proyecto: un resultado se lee en un segundo y un nombre propio no.
   */
  readonly headline: string;
  readonly summary: string;
  readonly highlights: readonly string[];
}

/** Prosa de un proyecto, indexada por el id de perfil.json. */
export interface ProjectCopy {
  readonly title: string;
  readonly summary: string;
  /** Enlace externo cuando lo hay: repo público, artículo, sitio. */
  readonly href?: string;
  readonly hrefLabel?: string;
  /**
   * Una tarjeta puede ocupar dos columnas y llevar más texto. Es para el
   * proyecto que más dice de mí, no para el que más me gusta.
   */
  readonly featured?: boolean;
  /** Sólo en la tarjeta destacada: qué va a poder verse cuando salga. */
  readonly bullets?: readonly string[];
}

export interface FailureMode {
  readonly id: string;
  readonly title: string;
  readonly symptom: string;
  readonly fix: string;
  readonly lesson: string;
  readonly cites: readonly CiteKey[];
}

export interface Dictionary {
  /**
   * `false` mientras la traducción esté a medias: el idioma queda fuera del
   * sitemap y de los hreflang, y se marca noindex.
   */
  readonly complete: boolean;
  readonly locale: Locale;
  readonly localeName: string;
  readonly htmlLang: string;

  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly keywords: readonly string[];
    readonly ogAlt: string;
  };

  readonly nav: {
    readonly menu: string;
    readonly close: string;
    readonly skipToContent: string;
    readonly switchTo: string;
  };

  readonly hero: {
    readonly eyebrow: string;
    /** Una frase de posicionamiento. Dos partes sólo para poder resaltar. */
    readonly positioning: string;
    readonly positioningAccent: string;
    readonly summary: string;
    readonly availability: string;
    readonly ctaContact: string;
    readonly ctaResume: string;
  };

  /** El marco: el mapa, sus nodos y la ruta. El único sitio con vocabulario de agente fuera de "Bajo el capó". */
  readonly map: {
    /** La pista bajo el núcleo: "Haz scroll o toca un nodo". */
    readonly hint: string;
    readonly cvMode: string;
    readonly exploreMode: string;
    readonly close: string;
    /** El primer tramo de la ruta después de ~. */
    readonly home: string;
    readonly routeAria: string;
    readonly mapAria: string;
    /** El término normal de cada nodo, traducido; el término de agente vive en map-graph.ts. */
    readonly nodes: Readonly<Record<NodeId, { readonly name: string }>>;
  };

  /** System prompt · Quién soy. */
  readonly who: {
    readonly title: string;
    readonly intro?: string;
    readonly lookingFor: string;
    readonly since2021: string;
  };

  /** Training · Formación. */
  readonly training: {
    readonly title: string;
  };

  /** El momento de Dalton: el sistema de más de 180 nodos que colapsa en un orquestador. */
  readonly moment: {
    readonly caption: string;
    readonly before: string;
    readonly after: string;
    readonly metric: string;
  };

  readonly metrics: {
    readonly sourceNote: string;
    readonly items: readonly Metric[];
  };

  readonly experience: {
    readonly title: string;
    readonly present: string;
    readonly roles: Readonly<Record<string, RoleCopy>>;
  };

  readonly projects: {
    readonly title: string;
    readonly intro: string;
    readonly inProgress: string;
    readonly viewCode: string;
    readonly readPaper: string;
    readonly privateRepo: string;
    readonly items: Readonly<Record<string, ProjectCopy>>;
  };

  readonly publication: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly limitations: string;
    readonly readPaper: string;
    readonly results: readonly { readonly value: string; readonly label: string }[];
  };

  readonly skills: {
    readonly title: string;
  };

  readonly certifications: {
    readonly inProgress: string;
    readonly gpa: string;
  };

  readonly thinking: {
    /** "Cómo pienso": el rótulo del bloque dentro de "Quién soy". */
    readonly eyebrow: string;
    readonly intro: string;
    readonly symptom: string;
    readonly fix: string;
    readonly lesson: string;
    readonly items: readonly FailureMode[];
  };

  readonly contact: {
    readonly title: string;
    readonly body: string;
    readonly email: string;
    readonly location: string;
    readonly linkedin: string;
    readonly github: string;
    readonly resume: string;
  };

  /** El marcador de la corrida grabada, dentro de "Bajo el capó". */
  readonly run: {
    readonly title: string;
    readonly run: string;
    readonly model: string;
    readonly input: string;
    readonly reasoning: string;
    readonly output: string;
    readonly time: string;
    readonly state: string;
    /** "{n} tok" */
    readonly tokens: string;
    readonly pending: string;
    readonly done: string;
    readonly note: string;
    readonly recordedFrom: string;
  };

  /** Bajo el capó (la ventana de contexto) y los rótulos de formación. */
  readonly context: {
    readonly title: string;
    readonly intro: string;
    readonly window: string;
    readonly windowNote: string;
    /** "{n} tokens" */
    readonly tokens: string;
    readonly pendingBlocks: string;
    readonly education: string;
    readonly languages: string;
    readonly certifications: string;
    readonly sources: string;
    /** Traducción de `educacion.contexto`; en español va el YAML tal cual. */
    readonly contextLine: string | null;
    /** Nombres en inglés de los bloques del prompt; en español van tal cual. */
    readonly blocks: Readonly<Record<string, string>>;
  };

  readonly footer: {
    /** aria-label del enlace de trazabilidad por bloque. `{label}` = la línea. */
    readonly sourceAria: string;
    /** La única mención a la fuente de verdad en toda la página. */
    readonly generated: string;
    readonly generatedLink: string;
    readonly builtWith: string;
  };

  readonly months: readonly string[];

  /**
   * Traducción de los términos en prosa que vienen de perfil.yaml. Lo que no
   * esté aquí pasa tal cual, que es lo correcto para "PyTorch" o "Redis".
   */
  readonly terms: Readonly<Record<string, string>>;
}
