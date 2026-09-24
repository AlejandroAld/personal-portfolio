import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";
import type { Locale } from "@/content/dictionary";
import { contacto, educacion, perfil, persona, publicacion, term } from "@/content/perfil";
import { CV_AGENT_URL } from "@/lib/evidence";
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

/**
 * Datos estructurados. Sin teléfono y sin dirección: sólo la ciudad.
 *
 * Todo lo que afirma sale de perfil.yaml: el puesto es el `titular`, la
 * ciudad, el estado y el país son los tres tramos de `ubicacion`, los temas
 * son las categorías de habilidades, y la revista es lo que va antes de la
 * primera coma en `medio`. La descripción es la meta de la página, que es
 * prosa editorial anclada como el resto.
 */
function jsonLd(lang: Locale) {
  const dict = getDictionary(lang);
  const [addressLocality, addressRegion, addressCountry] = persona.ubicacion.split(",").map((s) => s.trim());
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: persona.nombre,
    alternateName: persona.alias,
    jobTitle: term(persona.titular, dict),
    description: dict.meta.description,
    url: absoluteUrl(`/${lang}`),
    email: `mailto:${contacto.email}`,
    sameAs: [contacto.linkedin, contacto.github, CV_AGENT_URL],
    address: { "@type": "PostalAddress", addressLocality, addressRegion, addressCountry },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: educacion.institucion,
    },
    knowsLanguage: persona.idiomas.map((i) => term(i.idioma, dict)),
    knowsAbout: perfil.habilidades.map((g) => term(g.categoria, dict)),
    subjectOf: {
      "@type": "ScholarlyArticle",
      name: publicacion.titulo,
      url: publicacion.url,
      inLanguage: "en",
      isPartOf: { "@type": "Periodical", name: publicacion.medio.split(",")[0].trim() },
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
    // `data-mode` lo pone el script de abajo antes del primer pintado; React
    // no lo conoce y no tiene que avisar de la diferencia.
    <html lang={dict.htmlLang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }}
        />
        {/*
          El modo, el umbral y el nivel, decididos antes de pintar para que no
          haya destello. Con JavaScript: /xx/cv abre en Modo CV; si hay una
          elección guardada en este navegador, se abre en ella; un enlace
          directo a un nodo abre el mapa; y si no hay nada de eso, es la
          primera visita y sale el umbral. Sin WebGL, Modo CV directo: se
          prueba aquí, con un contexto que se suelta al instante, porque
          decidirlo después de pintar sería el destello que se quiere evitar.
          El nivel sale de la URL (idioma / nodo / subnodo), igual que lo lee
          el explorador después. Sin JavaScript no corre nada y el CSS muestra
          la columna completa.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){var d=document.documentElement;var p=location.pathname.split("/").filter(Boolean);var cv=p[1]==="cv";var n=cv?1:p.length;d.dataset.level=n>=3?"sub":n===2?"node":"map";var m=null;try{m=localStorage.getItem("modo")}catch(e){}var mode=cv?"cv":m==="cv"||m==="explore"?m:n>=2?"explore":"threshold";if(mode!=="cv"){try{var c=document.createElement("canvas");var g=c.getContext("webgl2")||c.getContext("webgl");if(!g){mode="cv"}else{var x=g.getExtension("WEBGL_lose_context");if(x)x.loseContext()}}catch(e){mode="cv"}}d.dataset.mode=mode})()',
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-sm focus:bg-accent-solid focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          {dict.nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
