/**
 * Configuración del sitio y de los idiomas.
 */

import type { Dictionary, Locale } from "@/content/dictionary";
import en from "@/content/en";
import es from "@/content/es";

export const SITE_URL = "https://josealejandroaldamaramos.vercel.app";

/**
 * El agente desplegado. Público por definición: el navegador habla con
 * `/api/chat`, que no lleva credencial y está limitado por IP. La llave del
 * endpoint Bearer NUNCA entra a este repo, y menos como NEXT_PUBLIC_*.
 */
export const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL ??
  "https://cv-agent.mangopond-59d644ac.eastus2.azurecontainerapps.io";

export const AGENT_CHAT_ENDPOINT = `${AGENT_URL.replace(/\/$/, "")}/api/chat`;

/**
 * El CV en PDF todavía no existe. El botón está construido y apagado: para
 * encenderlo, sube el archivo a `public/` y pon esto en su ruta.
 */
export const RESUME_URL: string | null = null;

export const LOCALES = ["en", "es"] as const;
export const DEFAULT_LOCALE: Locale = "en";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Los idiomas ya traducidos: los únicos que entran a sitemap y hreflang. */
export function publishedLocales(): Locale[] {
  return LOCALES.filter((l) => DICTIONARIES[l].complete);
}

export function localePath(locale: Locale): string {
  return `/${locale}`;
}

export function absoluteUrl(path = ""): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
