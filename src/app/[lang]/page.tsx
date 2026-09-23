import { notFound } from "next/navigation";

import AgentStage from "@/components/agent/AgentStage";
import RunMarker from "@/components/agent/RunMarker";
import Contact from "@/components/Contact";
import Context from "@/components/Context";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import Publication from "@/components/Publication";
import Skills from "@/components/Skills";
import Thinking from "@/components/Thinking";
import { getRun } from "@/content/runs";
import { LOCALES, RESUME_URL, getDictionary, isLocale, publishedLocales } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/**
 * La página es la ejecución del agente de CV respondiendo la pregunta grabada:
 * seis pasos, una sección cada uno, y el marcador arriba avanza con el scroll.
 * Los pasos 1 y 2 están; el 3 (experiencia), el 4 (cómo pienso) y el 6
 * (contacto) conservan por ahora su contenido de siempre con su número de paso,
 * y el 5 (fuentes) llega con ellos. Ver docs/agent-run-map.md.
 */
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const run = getRun(lang);

  // La etiqueta sale del idioma ACTUAL, no del destino: `switchTo` es el texto
  // que esta página muestra para irse al otro idioma, y va escrito en ese otro
  // idioma. Tomarlo del destino hacía que /es ofreciera "Ver en español".
  const otro = publishedLocales().find((l) => l !== lang);
  const languageSwitch = otro ? { href: `/${otro}`, label: dict.nav.switchTo } : null;

  // El paso 3 se llama por lo que la corrida grabada hizo de verdad.
  const stepNames = dict.run.stepNames.map((name, i) => (i === 2 && (run.tool_calls?.count ?? 0) > 0 ? dict.run.toolsStepName : name));

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
      <RunMarker
        run={run}
        locale={dict.htmlLang}
        copy={{ ...dict.run.marker, stepOf: dict.run.stepLabel, stepNames }}
      />
      <AgentStage />

      <main id="main" className="page">
        <Hero dict={dict} run={run} />
        <Context dict={dict} run={run} />
        <Experience dict={dict} />
        <Projects dict={dict} />
        <Publication dict={dict} />
        <Skills dict={dict} />
        <Thinking dict={dict} />
        <Contact dict={dict} />
      </main>

      <Footer dict={dict} />
    </>
  );
}
