import type { MetadataRoute } from "next";
import { NODES, SUBNODES, cvPath, pathFor, type NodeId } from "@/lib/map-graph";
import { absoluteUrl, getDictionary, publishedLocales } from "@/lib/site";

/**
 * Sólo los idiomas terminados entran al sitemap, y cada entrada declara sus
 * alternativas. Un idioma a medio traducir no se anuncia a un buscador.
 *
 * Cada nodo y cada subnodo del mapa tienen su URL, así que van también.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = publishedLocales();
  const entry = (node: NodeId | null, sub: string | null, priority: number): MetadataRoute.Sitemap[number][] =>
    locales.map((locale) => ({
      url: absoluteUrl(pathFor(locale, node, sub)),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [getDictionary(l).htmlLang, absoluteUrl(pathFor(l, node, sub))])),
      },
    }));

  const cv: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: absoluteUrl(cvPath(locale)),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
    alternates: { languages: Object.fromEntries(locales.map((l) => [getDictionary(l).htmlLang, absoluteUrl(cvPath(l))])) },
  }));
  return [
    ...entry(null, null, 1),
    ...cv,
    ...NODES.filter((n) => n.id !== "core").flatMap((n) => entry(n.id, null, 0.8)),
    ...NODES.flatMap((n) => (SUBNODES[n.id] ?? []).flatMap((s) => entry(n.id, s.ref, 0.6))),
  ];
}
