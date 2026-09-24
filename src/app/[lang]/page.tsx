import { notFound } from "next/navigation";
import Site from "@/components/Site";
import { LOCALES, isLocale } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/** El mapa: la primera pantalla, con el núcleo al centro. */
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Site lang={lang} node={null} sub={null} />;
}
