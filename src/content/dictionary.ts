/**
 * La forma del contenido del sitio.
 *
 * El reparto es deliberado:
 *
 *   perfil.json  →  los HECHOS estructurales: fechas, empresas, puestos,
 *                   stacks, habilidades, estudios, publicación. Nunca se
 *                   reescriben a mano; salen de perfil.yaml.
 *   Dictionary   →  la PROSA: tesis, encabezados, el marco de cada caso de
 *                   estudio, los modos de falla, y las traducciones.
 *
 * Así una fecha mal puesta se arregla en el YAML y se corrige en los dos
 * idiomas a la vez, y ningún dato vive en dos lugares.
 */

import type { CiteKey } from "@/lib/evidence";

export type Locale = "en" | "es";

/** Una métrica de portada. El contador anima hacia `countTo`. */
export interface Metric {
  /** Lo que se renderiza en HTML antes de que corra el contador. */
  readonly value: string;
  readonly countTo?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly label: string;
  readonly detail: string;
  readonly cite: CiteKey;
}

export interface CaseStudy {
  readonly id: string;
  /** id dentro de `proyectos` de perfil.json, de donde sale el stack. */
  readonly perfilId?: string;
  readonly title: string;
  readonly kicker: string;
  readonly problem: string;
  readonly decision: string;
  readonly result: string;
  /** Sólo cuando el stack no viene de un proyecto del perfil. */
  readonly stack?: readonly string[];
  readonly repo?: string;
  readonly cite: CiteKey;
}

export interface FailureMode {
  readonly id: string;
  readonly title: string;
  /** Qué se rompió, en concreto. */
  readonly symptom: string;
  /** Qué hice. */
  readonly fix: string;
  /** Por qué generaliza más allá de este bug. */
  readonly lesson: string;
  readonly cites: readonly CiteKey[];
}

export interface Dictionary {
  /**
   * `false` mientras la traducción esté a medias: el idioma queda fuera del
   * sitemap y de los hreflang, y se marca noindex. Es preferible a publicar
   * media página en el idioma equivocado y que un buscador la indexe así.
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
    readonly work: string;
    readonly agent: string;
    readonly cases: string;
    readonly thinking: string;
    readonly track: string;
    readonly contact: string;
    readonly menu: string;
    readonly close: string;
    readonly skipToContent: string;
    readonly switchTo: string;
  };

  readonly hero: {
    readonly eyebrow: string;
    readonly thesis: string;
    readonly thesisAccent: string;
    readonly summary: string;
    readonly availability: string;
    readonly ctaPrimary: string;
    readonly ctaSecondary: string;
    readonly ctaResume: string;
    readonly portraitAlt: string;
    readonly metrics: readonly Metric[];
    readonly evidenceNote: string;
  };

  /**
   * La sección del agente. Hoy es un teaser: el cliente de chat existe en la
   * rama pero no se publica todavía, así que esta sección vende lo que viene
   * en vez de disculparse por lo que falta.
   *
   * `chat` se conserva intacto para el día que la demo salga: encenderla es
   * volver a importar el cliente en DemoSection, no reescribir contenido.
   */
  readonly demo: {
    readonly eyebrow: string;
    readonly title: string;
    readonly intro: string;

    /** Las etapas del flujo interno que la demo va a exponer. */
    readonly stagesTitle: string;
    readonly stages: readonly { readonly title: string; readonly body: string }[];

    readonly whyTitle: string;
    readonly why: string;

    readonly ctaRepo: string;
    readonly ctaRepoNote: string;

    readonly exampleTitle: string;
    readonly exampleNote: string;
    /**
     * Un intercambio real. Las respuestas son las que el perfil ya fija para
     * esas preguntas, no redactadas para esta página.
     */
    readonly example: readonly { readonly q: string; readonly a: string }[];

    readonly architectureTitle: string;
    readonly architecture: readonly {
      readonly title: string;
      readonly body: string;
      readonly cite: CiteKey;
    }[];

    /** Cadenas del cliente de chat. Sin uso mientras la demo no se publique. */
    readonly chat: {
      readonly launch: string;
      readonly placeholder: string;
      readonly send: string;
      readonly sending: string;
      readonly suggestionsLabel: string;
      readonly suggestions: readonly string[];
      readonly you: string;
      readonly agent: string;
      readonly thinking: string;
      readonly reset: string;
      readonly liveLabel: string;
      readonly errorGeneric: string;
      readonly errorRateLimit: string;
      readonly errorOffline: string;
      readonly transcriptLabel: string;
      readonly disclaimer: string;
    };
  };

  readonly cases: {
    readonly eyebrow: string;
    readonly title: string;
    readonly intro: string;
    readonly problem: string;
    readonly decision: string;
    readonly result: string;
    readonly stack: string;
    readonly expand: string;
    readonly collapse: string;
    readonly viewCode: string;
    readonly privateCode: string;
    readonly alsoTitle: string;
    readonly items: readonly CaseStudy[];
    readonly also: readonly { readonly title: string; readonly body: string; readonly cite: CiteKey }[];
  };

  readonly thinking: {
    readonly eyebrow: string;
    readonly title: string;
    readonly intro: string;
    readonly symptom: string;
    readonly fix: string;
    readonly lesson: string;
    readonly evidence: string;
    readonly items: readonly FailureMode[];
  };

  readonly track: {
    readonly eyebrow: string;
    readonly title: string;
    readonly present: string;
    readonly education: string;
    readonly publication: string;
    readonly readPaper: string;
    readonly certifications: string;
    readonly inProgress: string;
    readonly stackTitle: string;
    readonly gpa: string;
    /** Prosa por puesto, indexada por el id de perfil.json. */
    readonly roles: Readonly<Record<string, { readonly summary: string; readonly highlights: readonly string[] }>>;
  };

  readonly contact: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly email: string;
    readonly linkedin: string;
    readonly github: string;
    readonly availability: string;
  };

  readonly footer: {
    readonly sourceNote: string;
    readonly builtWith: string;
    readonly rights: string;
  };

  readonly months: readonly string[];

  /**
   * Traducción de los términos en prosa que vienen de perfil.yaml. Lo que no
   * esté aquí pasa tal cual, que es lo correcto para "PyTorch", "Redis" o
   * "LangGraph". Así agregar una tecnología al YAML no exige tocar el
   * diccionario.
   */
  readonly terms: Readonly<Record<string, string>>;
}
