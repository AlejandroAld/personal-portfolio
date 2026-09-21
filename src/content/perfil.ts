/**
 * Acceso tipado a la fuente de verdad.
 *
 * perfil.json lo genera `npm run sync:perfil` desde el repo del agente. Este
 * módulo le pone tipos y ofrece los ayudantes que necesitan las secciones.
 * Nada de aquí se edita a mano.
 */

import raw from "./perfil.json";
import type { Dictionary } from "./dictionary";

export interface PerfilRol {
  readonly id: string;
  readonly puesto: string;
  readonly empresa: string;
  readonly inicio: string;
  readonly fin: string;
  readonly ubicacion: string;
  readonly resumen: string;
  readonly logros: readonly string[];
  readonly stack: readonly string[];
}

export interface PerfilProyecto {
  readonly id: string;
  readonly nombre: string;
  readonly resumen: string;
  readonly detalle: string;
  readonly stack: readonly string[];
  readonly repo?: string;
}

export interface PerfilHabilidad {
  readonly categoria: string;
  readonly items: readonly string[];
}

export interface Perfil {
  readonly _meta: { readonly fuente: string; readonly sha: string; readonly sincronizado: string; readonly repo: string };
  readonly persona: {
    readonly nombre: string;
    readonly alias: string;
    readonly titular: string;
    /** Párrafo del héroe del sitio público. `resumen` es la versión completa del agente. */
    readonly presentacion: string;
    readonly ubicacion: string;
    readonly disponibilidad: string;
    readonly idiomas: readonly { readonly idioma: string; readonly nivel: string }[];
    readonly contacto: { readonly email: string; readonly linkedin: string; readonly github: string };
  };
  readonly resumen: string;
  readonly experiencia: readonly PerfilRol[];
  readonly proyectos: readonly PerfilProyecto[];
  readonly habilidades: readonly PerfilHabilidad[];
  readonly educacion: readonly { readonly titulo: string; readonly institucion: string; readonly periodo: string }[];
  readonly publicaciones: readonly {
    readonly titulo: string;
    readonly medio: string;
    readonly url: string;
    readonly idioma: string;
    readonly keywords: readonly string[];
  }[];
  readonly certificaciones: readonly { readonly nombre: string; readonly estado: string }[];
}

export const perfil = raw as unknown as Perfil;

export const persona = perfil.persona;
export const contacto = persona.contacto;
export const publicacion = perfil.publicaciones[0];
export const educacion = perfil.educacion[0];

/** El puesto o proyecto con ese id, o `undefined` si el YAML cambió. */
export function rol(id: string): PerfilRol | undefined {
  return perfil.experiencia.find((r) => r.id === id);
}

export function proyecto(id: string): PerfilProyecto | undefined {
  return perfil.proyectos.find((p) => p.id === id);
}

/**
 * Traduce un término de perfil.yaml si el diccionario lo cubre. Lo que no
 * esté, pasa tal cual: es lo correcto para nombres propios de tecnología.
 */
export function term(value: string, dict: Dictionary): string {
  return dict.terms[value] ?? value;
}

export function terms(values: readonly string[], dict: Dictionary): string[] {
  return values.map((v) => term(v, dict));
}

/** "2025-11" → "Nov 2025". "actual" → la palabra del diccionario. */
export function formatMonth(value: string, dict: Dictionary): string {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return dict.experience.present;
  const mes = dict.months[Number(m[2]) - 1];
  return mes ? `${mes} ${m[1]}` : m[1];
}

export function formatPeriod(inicio: string, fin: string, dict: Dictionary): string {
  return `${formatMonth(inicio, dict)} — ${formatMonth(fin, dict)}`;
}

/** Sólo el año y el promedio del periodo de estudios, sin reescribirlo. */
export function educacionPeriodo(): { years: string; gpa: string | null } {
  // "2021-02 a 2025-01. Promedio 9.31 / 10.0"
  const years = /(\d{4})-\d{2}\s*a\s*(\d{4})-\d{2}/.exec(educacion.periodo);
  const gpa = /([\d.]+\s*\/\s*[\d.]+)/.exec(educacion.periodo);
  return {
    years: years ? `${years[1]} — ${years[2]}` : educacion.periodo,
    gpa: gpa ? gpa[1] : null,
  };
}
