import type { Dictionary } from "@/content/dictionary";
import { educacion, perfil, persona, publicacion } from "@/content/perfil";
import { TOUR } from "./map-graph";
import { FLIGHT_MS } from "./tokens";

/**
 * Los tiempos del umbral se calculan, no se inventan.
 *
 * - Leer el CV: las palabras del texto real de la columna —lo que dicen las
 *   siete salas y el núcleo, en el idioma de la página— a 230 palabras por
 *   minuto, redondeado hacia arriba.
 * - Explorar: la duración real del tour, que es la suma, parada por parada,
 *   del vuelo de la cámara y de leer lo que abre cada sala (el nombre del
 *   nodo, el título y la entrada) a las mismas 230 palabras por minuto, más
 *   un segundo y medio de asentamiento por parada. Redondeado hacia arriba.
 */

export const WPM = 230;
const SETTLE_MS = 1500;

function words(...texts: (string | null | undefined)[]): number {
  return texts.reduce((n, t) => n + (t ? t.trim().split(/\s+/).filter(Boolean).length : 0), 0);
}

/** Las palabras que la columna del CV muestra de verdad. */
export function cvWords(dict: Dictionary): number {
  let n = 0;
  // El núcleo.
  n += words(persona.nombre, dict.hero.eyebrow, dict.hero.positioning, dict.hero.positioningAccent);
  n += dict.metrics.items.reduce((m, it) => m + words(it.value, it.label), 0);
  // Quién soy.
  n += words(dict.who.title, dict.hero.summary, dict.who.lookingFor, dict.hero.availability, dict.who.since2021, dict.context.contextLine ?? educacion.contexto);
  n += words(dict.thinking.eyebrow, dict.thinking.intro);
  n += dict.thinking.items.reduce((m, it) => m + words(it.title, it.symptom, it.fix, it.lesson), 0);
  // Experiencia.
  n += words(dict.experience.title);
  for (const rol of perfil.experiencia) {
    const copy = dict.experience.roles[rol.id];
    n += words(rol.empresa, rol.puesto, rol.ubicacion, copy?.headline, copy?.summary, ...(copy?.highlights ?? []), ...rol.stack.slice(0, 10));
  }
  n += words(dict.moment.caption);
  // Proyectos.
  n += words(dict.projects.title, dict.projects.intro);
  for (const p of perfil.proyectos) {
    const copy = dict.projects.items[p.id];
    n += words(copy?.title, copy?.summary, ...(copy?.bullets ?? []), ...p.stack);
  }
  // Stack.
  n += words(dict.skills.title);
  n += perfil.habilidades.reduce((m, g) => m + words(g.categoria, ...g.items), 0);
  // Formación.
  n += words(dict.training.title, educacion.titulo, educacion.institucion, dict.publication.title, publicacion.medio, dict.publication.body, dict.publication.limitations);
  n += persona.idiomas.reduce((m, i) => m + words(i.idioma, i.nivel), 0);
  n += perfil.certificaciones.reduce((m, c) => m + words(c.nombre), 0);
  // Contacto y bajo el capó.
  n += words(dict.contact.title, dict.contact.body, dict.context.title, dict.context.intro, dict.run.note);
  return n;
}

/** Lo que abre cada parada del tour: el nombre del nodo, el título y la entrada de su sala. */
function stopWords(dict: Dictionary, node: string): number {
  switch (node) {
    case "prompt":
      return words(dict.map.nodes.prompt.name, dict.who.title, dict.hero.summary);
    case "memory":
      return words(dict.map.nodes.memory.name, dict.experience.title);
    case "outputs":
      return words(dict.map.nodes.outputs.name, dict.projects.title, dict.projects.intro);
    case "tools":
      return words(dict.map.nodes.tools.name, dict.skills.title);
    case "training":
      return words(dict.map.nodes.training.name, dict.training.title);
    case "api":
      return words(dict.map.nodes.api.name, dict.contact.title, dict.contact.body);
    case "hood":
      return words(dict.map.nodes.hood.name, dict.context.title, dict.context.intro);
    default:
      return words(persona.nombre, dict.hero.positioning, dict.hero.positioningAccent);
  }
}

export function tourMs(dict: Dictionary): number {
  let ms = 0;
  for (const stop of TOUR) {
    const w = stop.sub ? words(dict.experience.roles[stop.sub]?.headline, dict.experience.roles[stop.sub]?.summary, dict.moment.caption) : stopWords(dict, stop.node);
    ms += FLIGHT_MS + SETTLE_MS + (w / WPM) * 60000;
  }
  return ms;
}

export function ceilMinutes(ms: number): number {
  return Math.max(1, Math.ceil(ms / 60000));
}

export function readingTimes(dict: Dictionary): { cvWords: number; cvMinutes: number; tourMs: number; tourMinutes: number } {
  const w = cvWords(dict);
  const t = tourMs(dict);
  return { cvWords: w, cvMinutes: ceilMinutes((w / WPM) * 60000), tourMs: t, tourMinutes: ceilMinutes(t) };
}
