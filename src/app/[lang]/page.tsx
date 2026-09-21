import { notFound } from "next/navigation";

import CaseStudies from "@/components/CaseStudies";
import Contact from "@/components/Contact";
import DemoSection from "@/components/DemoSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Thinking from "@/components/Thinking";
import Track from "@/components/Track";
import { LOCALES, getDictionary, isLocale, publishedLocales } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Sólo se ofrece cambiar a un idioma que esté terminado. Mientras el español
  // esté a medias la ruta /es existe y se puede revisar a mano, pero no se
  // anuncia: enviar a alguien a media traducción es peor que no ofrecerla.
  // La etiqueta sale del idioma ACTUAL, no del destino: `switchTo` es el texto
  // que esta página muestra para irse al otro idioma, y va escrito en ese otro
  // idioma. Tomarlo del destino hacía que /es ofreciera "Ver en español".
  const otro = publishedLocales().find((l) => l !== lang);
  const languageSwitch = otro ? { href: `/${otro}`, label: dict.nav.switchTo } : null;

  return (
    <>
      <Nav
        links={[
          { href: "#cases", label: dict.nav.cases },
          { href: "#thinking", label: dict.nav.thinking },
          { href: "#track", label: dict.nav.track },
          { href: "#contact", label: dict.nav.contact },
        ]}
        labels={{ menu: dict.nav.menu, close: dict.nav.close }}
        cta={{ href: "#agent", label: dict.nav.agent }}
        languageSwitch={languageSwitch}
      />

      <main id="main">
        <Hero dict={dict} />
        <DemoSection dict={dict} />
        <CaseStudies dict={dict} />
        <Thinking dict={dict} />
        <Track dict={dict} />
        <Contact dict={dict} />
      </main>

      <Footer dict={dict} />
    </>
  );
}
