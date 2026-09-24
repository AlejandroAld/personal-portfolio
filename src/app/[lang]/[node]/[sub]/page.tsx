import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Site from "@/components/Site";
import { NODES, SUBNODES, nodeBySlug, pathFor, subBySlug } from "@/lib/map-graph";
import { LOCALES, absoluteUrl, getDictionary, isLocale } from "@/lib/site";

export const dynamicParams = false;

/** Una ruta por subnodo: /es/memoria/dalton, /en/memory/dalton… */
export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    NODES.flatMap((n) => (SUBNODES[n.id] ?? []).map((s) => ({ lang, node: n.slug[lang], sub: s.slug[lang] }))),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; node: string; sub: string }> }): Promise<Metadata> {
  const { lang, node, sub } = await params;
  if (!isLocale(lang)) return {};
  const n = nodeBySlug(lang, node);
  const s = n && subBySlug(lang, n.id, sub);
  if (!n || !s) return {};
  const dict = getDictionary(lang);
  const role = dict.experience.roles[s.ref];
  return {
    title: `${role?.headline ?? s.slug[lang]} · ${dict.meta.title}`,
    alternates: { canonical: absoluteUrl(pathFor(lang, n.id, s.ref)) },
  };
}

export default async function SubPage({ params }: { params: Promise<{ lang: string; node: string; sub: string }> }) {
  const { lang, node, sub } = await params;
  if (!isLocale(lang)) notFound();
  const n = nodeBySlug(lang, node);
  const s = n && subBySlug(lang, n.id, sub);
  if (!n || !s) notFound();
  return <Site lang={lang} node={n.id} sub={s.ref} />;
}
