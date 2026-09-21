import type { Dictionary } from "@/content/dictionary";
import { contacto, persona } from "@/content/perfil";
import { PORTRAIT_URL, RESUME_URL } from "@/lib/site";
import Counter from "./Counter";
import HeroBackdrop from "./HeroBackdrop";
import Evidence from "./Evidence";
import Reveal from "./Reveal";

/**
 * Arriba del pliegue.
 *
 * El trabajo de esta sección es que alguien de reclutamiento entienda quién soy
 * en diez segundos, también en un teléfono: una tesis, cuatro cifras y dos
 * acciones. Cada cifra enlaza a la línea del perfil de donde sale, porque una
 * cifra sin fuente es una cifra que hay que creer.
 *
 * El LCP de la página es el texto de la tesis. No hay imagen que lo retrase, y
 * el fondo de WebGL se carga después del primer pintado, nunca antes.
 */
export default function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section id="top" className="relative isolate px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20">
      <HeroBackdrop />
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* El hueco del retrato: cuando PORTRAIT_URL exista, la segunda
            columna se llena y nada más cambia de sitio. */}
        <div className={PORTRAIT_URL ? "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-14" : ""}>
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-wide text-accent sm:text-sm">
              {dict.hero.eyebrow}
            </p>

            <h1 className="mt-5 text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
              {dict.hero.thesis}{" "}
              <span className="text-muted">{dict.hero.thesisAccent}</span>
            </h1>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted text-pretty">
              {dict.hero.summary}
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-subtle text-pretty">
              {dict.hero.availability}{" "}
              <Evidence cite="availability" />
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#agent"
                className="inline-flex items-center gap-2 rounded bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover"
              >
                {dict.hero.ctaPrimary}
                <span aria-hidden="true">→</span>
              </a>
              <a
                href={`mailto:${contacto.email}`}
                className="inline-flex items-center gap-2 rounded border border-border-strong px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
              >
                {dict.hero.ctaSecondary}
              </a>
              {/* Apagado hasta que exista el archivo. Encenderlo es poner la
                  ruta en RESUME_URL. */}
              {RESUME_URL && (
                <a
                  href={RESUME_URL}
                  className="inline-flex items-center gap-2 rounded px-3 py-2.5 font-mono text-xs text-muted transition-colors hover:text-accent"
                  download
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

        {/* --- Las cuatro cifras --- */}
        <div className="mt-14 border-t border-border pt-10 sm:mt-16">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {dict.hero.metrics.map((metric, i) => (
              <li key={metric.cite}>
                <Reveal delay={i * 70}>
                  <p
                    className={`font-semibold tracking-tight text-fg ${
                      metric.countTo === undefined ? "text-2xl sm:text-[1.75rem]" : "text-4xl sm:text-5xl"
                    }`}
                  >
                    {metric.countTo === undefined ? (
                      metric.value
                    ) : (
                      <Counter to={metric.countTo} prefix={metric.prefix} suffix={metric.suffix} />
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium text-fg text-pretty">{metric.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-subtle text-pretty">{metric.detail}</p>
                  <p className="mt-2.5">
                    <Evidence cite={metric.cite} />
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-mono text-xs text-subtle">
            {dict.hero.evidenceNote}
          </p>
        </div>

        <span className="sr-only">{persona.nombre}</span>
      </div>
    </section>
  );
}
