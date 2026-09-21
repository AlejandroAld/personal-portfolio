import type { Dictionary } from "@/content/dictionary";
import { contacto, persona } from "@/content/perfil";
import { PORTRAIT_URL, RESUME_URL } from "@/lib/site";
import HeroBackdrop from "./HeroBackdrop";

/**
 * Arriba del pliegue: quién soy en una frase y dos salidas.
 *
 * Nada más. Las cifras van en su propia tira justo abajo, y las secciones se
 * ganan el clic por sí solas. Un héroe que intenta decirlo todo no dice nada.
 *
 * El LCP de la página es este texto. No hay imagen ni canvas que lo retrase:
 * el fondo de WebGL se carga después del primer pintado.
 */
export default function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section id="top" className="relative isolate px-4 pt-28 pb-14 sm:px-6 sm:pt-36 sm:pb-16">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className={PORTRAIT_URL ? "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-14" : ""}>
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-wide text-accent sm:text-sm">{dict.hero.eyebrow}</p>

            <h1 className="mt-5 text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
              {dict.hero.positioning}{" "}
              <span className="text-muted">{dict.hero.positioningAccent}</span>
            </h1>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted text-pretty">{dict.hero.summary}</p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-subtle text-pretty">
              {dict.hero.availability}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover"
              >
                {dict.hero.ctaContact}
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded border border-border-strong px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
              >
                {dict.hero.ctaProjects}
              </a>
              {/* Apagado hasta que exista el archivo. Encenderlo es poner la
                  ruta en RESUME_URL. */}
              {RESUME_URL && (
                <a
                  href={RESUME_URL}
                  download
                  className="inline-flex items-center gap-2 rounded px-3 py-2.5 font-mono text-xs text-muted transition-colors hover:text-accent"
                >
                  {dict.hero.ctaResume}
                </a>
              )}
            </div>
          </div>

          {PORTRAIT_URL && (
            <div className="mt-10 lg:mt-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PORTRAIT_URL}
                alt={dict.hero.portraitAlt}
                width={180}
                height={180}
                className="h-40 w-40 rounded-full border border-border object-cover lg:h-44 lg:w-44"
              />
            </div>
          )}
        </div>

        <span className="sr-only">
          {persona.nombre} — {contacto.email}
        </span>
      </div>
    </section>
  );
}
