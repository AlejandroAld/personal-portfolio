import { notFound } from "next/navigation";

import Contact from "@/components/Contact";
import Credentials from "@/components/Credentials";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import Publication from "@/components/Publication";
import Skills from "@/components/Skills";
import Thinking from "@/components/Thinking";
import { LOCALES, RESUME_URL, getDictionary, isLocale, publishedLocales } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // La etiqueta sale del idioma ACTUAL, no del destino: `switchTo` es el texto
  // que esta página muestra para irse al otro idioma, y va escrito en ese otro
  // idioma. Tomarlo del destino hacía que /es ofreciera "Ver en español".
  const otro = publishedLocales().find((l) => l !== lang);
  const languageSwitch = otro ? { href: `/${otro}`, label: dict.nav.switchTo } : null;

  return (
    <>
      <Nav
        links={[
          { href: "#experience", label: dict.nav.experience },
          { href: "#projects", label: dict.nav.projects },
          { href: "#publication", label: dict.nav.publication },
          { href: "#skills", label: dict.nav.skills },
          { href: "#contact", label: dict.nav.contact },
        ]}
        labels={{ menu: dict.nav.menu, close: dict.nav.close }}
        // Apagado hasta que exista el PDF: ver RESUME_URL en src/lib/site.ts.
        cta={RESUME_URL ? { href: RESUME_URL, label: dict.hero.ctaResume } : null}
        languageSwitch={languageSwitch}
      />

      <main id="main">
        <Hero dict={dict} />
        <Metrics dict={dict} />
        <Experience dict={dict} />
        <Projects dict={dict} />
        <Publication dict={dict} />
        <Skills dict={dict} />
        <Credentials dict={dict} />
        <Thinking dict={dict} />
        <Contact dict={dict} />
      </main>

      <Footer dict={dict} />
    </>
  );
}
