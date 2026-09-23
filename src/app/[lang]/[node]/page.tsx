import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Site from "@/components/Site";
import { NODES, nodeBySlug, pathFor } from "@/lib/map-graph";
import { LOCALES, absoluteUrl, getDictionary, isLocale } from "@/lib/site";

export const dynamicParams = false;

/** Una ruta por nodo y por idioma: /es/memoria, /en/memory… */
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => NODES.filter((n) => n.id !== "core").map((n) => ({ lang, node: n.slug[lang] })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; node: string }> }): Promise<Metadata> {
  const { lang, node } = await params;
  if (!isLocale(lang)) return {};
  const n = nodeBySlug(lang, node);
  if (!n) return {};
  const dict = getDictionary(lang);
  const name = dict.map.nodes[n.id].name;
  return {
    title: `${name} — ${dict.meta.title}`,
    alternates: { canonical: absoluteUrl(pathFor(lang, n.id)) },
  };
}

export default async function NodePage({ params }: { params: Promise<{ lang: string; node: string }> }) {
  const { lang, node } = await params;
  if (!isLocale(lang)) notFound();
  const n = nodeBySlug(lang, node);
  if (!n) notFound();
  return <Site lang={lang} node={n.id} sub={null} />;
}
