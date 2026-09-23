import type { Dictionary } from "@/content/dictionary";
import { contacto, persona } from "@/content/perfil";
import type { Run } from "@/content/runs";
import { RESUME_URL } from "@/lib/site";
import { STEPS } from "@/lib/agent-graph";
import SourceLink from "./SourceLink";

/**
 * Paso 1 · Petición.
 *
 * Arriba de todo se escribe la pregunta que el agente grabado recibió —sale
 * del JSON de la corrida, no de aquí— y debajo aparece de inmediato la
 * respuesta corta: nombre, rol, las tres cifras y el contacto. Es lo que un
 * reclutador con prisa tiene que poder leer en cinco segundos, y todo es HTML
 * del servidor: la animación sólo reparte la entrada en el primer pintado.
 *
 * El LCP es el titular. No hay imagen ni lienzo que lo retrase: el escenario
 * 3D se carga después, en su propio chunk.
 */
export default function Hero({ dict, run }: { dict: Dictionary; run: Run }) {
  const words = run.question.split(" ");
  const handle = (url: string) => new URL(url).pathname.replace(/^\/|\/$/g, "");
  const stepLabel = dict.run.stepLabel.replace("{n}", "1").replace("{total}", String(STEPS));

  return (
    <section id="top" data-step="1" className="relative px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="eyebrow rise">
            {stepLabel} · {dict.run.stepNames[0]}
          </p>

          {/* La petición, palabra por palabra en la primera carga. */}
          <p className="prompt rise">
            <span aria-hidden="true" className="prompt-caret">
              ›
            </span>{" "}
            {words.map((w, i) => (
              <span key={i} className="prompt-word" style={{ animationDelay: `${i * 45}ms` }}>
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>

          <div className="answer">
            <p className="rise rise-2 text-sm font-medium text-fg">
              {persona.nombre} <span className="text-subtle">· {dict.hero.eyebrow}</span>
            </p>
            <h1 className="rise rise-2 mt-3 text-display-sm font-semibold tracking-tight text-balance sm:text-display-md lg:text-display">
              {dict.hero.positioning} <span className="text-muted">{dict.hero.positioningAccent}</span>
            </h1>

            <ul className="rise rise-3 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6" aria-label={dict.metrics.sourceNote}>
              {dict.metrics.items.map((metric) => (
                <li key={metric.cite}>
                  <p className="text-2xl font-semibold tracking-tight text-fg tnum sm:text-3xl">{metric.value}</p>
                  <p className="mt-1 text-xs leading-snug text-muted text-pretty">{metric.label}</p>
                  <SourceLink cite={metric.cite} ariaLabel={dict.footer.sourceAria} className="mt-1" />
                </li>
              ))}
            </ul>

            <ul className="rise rise-4 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <a href={`mailto:${contacto.email}`} className="text-fg underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                  {contacto.email}
                </a>
              </li>
              <li>
                <a href={contacto.linkedin} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                  {handle(contacto.linkedin)}
                </a>
              </li>
              <li>
                <a href={contacto.github} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                  @{handle(contacto.github)}
                </a>
              </li>
            </ul>
            <p className="rise rise-4 mt-3 text-sm leading-relaxed text-subtle text-pretty">{dict.hero.availability}</p>
          </div>

          <p className="mt-8 max-w-2xl leading-relaxed text-muted text-pretty">{dict.hero.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#contact" className="btn btn-primary">
              {dict.hero.ctaContact}
              <span aria-hidden="true">→</span>
            </a>
            <a href="#projects" className="btn btn-secondary">
              {dict.hero.ctaProjects}
            </a>
            {/* Apagado hasta que exista el PDF: encenderlo es poner la ruta en RESUME_URL. */}
            {RESUME_URL && (
              <a href={RESUME_URL} download className="btn btn-ghost">
                {dict.hero.ctaResume}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
