import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Site from "@/components/Site";
import { cvPath } from "@/lib/map-graph";
import { LOCALES, absoluteUrl, getDictionary, isLocale } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: `${dict.map.cvMode} — ${dict.meta.title}`, alternates: { canonical: absoluteUrl(cvPath(lang)) } };
}

/** El Modo CV con URL propia: /es/cv, /en/cv. La misma página, abierta como columna. */
export default async function CvPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Site lang={lang} node={null} sub={null} cv />;
}
