import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";
import type { Locale } from "@/content/dictionary";
import { contacto, educacion, persona, publicacion } from "@/content/perfil";
import { CV_AGENT_URL } from "@/lib/evidence";
import MotionProvider from "@/components/Motion";
import {
  LOCALES,
  SITE_URL,
  absoluteUrl,
  getDictionary,
  isLocale,
  publishedLocales,
} from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  // Sólo los idiomas traducidos entran a los hreflang. Anunciar una
  // alternativa a medio traducir es peor que no anunciarla.
  const listos = publishedLocales();
  const languages = Object.fromEntries(
    listos.map((l) => [getDictionary(l).htmlLang, absoluteUrl(`/${l}`)]),
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: [...dict.meta.keywords],
    authors: [{ name: persona.nombre, url: contacto.linkedin }],
    creator: persona.nombre,
    alternates: {
      canonical: absoluteUrl(`/${lang}`),
      languages: { ...languages, "x-default": absoluteUrl(`/${listos[0] ?? "en"}`) },
    },
    // Un idioma a medias no se indexa, pero sus enlaces sí se siguen.
    robots: dict.complete
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "profile",
      firstName: "José Alejandro",
      lastName: "Aldama Ramos",
      title: dict.meta.title,
      description: dict.meta.description,
      url: absoluteUrl(`/${lang}`),
      siteName: persona.nombre,
      locale: lang === "es" ? "es_MX" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

/** Datos estructurados. Sin teléfono y sin dirección: sólo la ciudad. */
function jsonLd(lang: Locale) {
  const dict = getDictionary(lang);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: persona.nombre,
    alternateName: persona.alias,
    jobTitle: `${dict.hero.positioning} ${dict.hero.positioningAccent}`,
    description: dict.meta.description,
    url: absoluteUrl(`/${lang}`),
    email: `mailto:${contacto.email}`,
    sameAs: [contacto.linkedin, contacto.github, CV_AGENT_URL],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Guadalajara",
      addressRegion: "Jalisco",
      addressCountry: "MX",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: educacion.institucion,
    },
    knowsLanguage: persona.idiomas.map((i) => i.idioma),
    knowsAbout: [
      "AI engineering",
      "LLM agents in production",
      "Agent evaluation",
      "Tool calling",
      "Model Context Protocol",
      "Retrieval-augmented generation",
      "Natural language processing",
    ],
    subjectOf: {
      "@type": "ScholarlyArticle",
      name: publicacion.titulo,
      url: publicacion.url,
      inLanguage: "en",
      isPartOf: { "@type": "Periodical", name: "Computación y Sistemas" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={dict.htmlLang}>
      <head>
        {/*
          Sin JS las secciones siguen visibles. La entrada progresiva es una
          mejora, nunca un requisito para leer la página.
        */}
        {/*
          `motion` serializa el estado inicial como estilo en línea, así que sin
          JS los bloques animados se quedarían invisibles. Una regla con
          !important sí gana a un estilo en línea: la entrada progresiva es una
          mejora, nunca un requisito para leer la página.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: "[data-reveal]{opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-accent-solid focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          {dict.nav.skipToContent}
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
