import type { MetadataRoute } from "next";
import { absoluteUrl, getDictionary, publishedLocales } from "@/lib/site";

/**
 * Sólo los idiomas terminados entran al sitemap, y cada entrada declara sus
 * alternativas. Un idioma a medio traducir no se anuncia a un buscador.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = publishedLocales();
  const languages = Object.fromEntries(
    locales.map((l) => [getDictionary(l).htmlLang, absoluteUrl(`/${l}`)]),
  );

  return locales.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: { languages },
  }));
}
