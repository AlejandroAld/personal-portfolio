import type { Dictionary } from "@/content/dictionary";
import { CV_AGENT_URL } from "@/lib/evidence";
import Evidence from "./Evidence";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * El proyecto héroe: el agente de CV.
 *
 * Hoy es un teaser. El cliente de chat está escrito y probado (AgentChat.tsx,
 * tests/agent-demo/) pero NO se importa desde aquí a propósito: mientras la
 * demo no se publique, no debe entrar al bundle ni tener ruta pública. Como
 * nada lo importa, Next no lo incluye en ningún chunk servido.
 *
 * Para encenderla: volver a importar AgentDemo, pasarle `dict.demo.chat` y
 * AGENT_CHAT_ENDPOINT. Las cadenas del cliente siguen en el diccionario,
 * completas y en los dos idiomas, para que encenderla no exija reescribir
 * contenido.
 *
 * Mientras tanto la sección vende lo que viene, no se disculpa por lo que
 * falta: qué va a mostrar el flujo interno, por qué eso importa, y un enlace
 * al código que ya se puede leer hoy.
 */
export default function DemoSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="agent" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.demo.eyebrow} title={dict.demo.title} intro={dict.demo.intro} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          {/* --- El flujo interno que la demo va a exponer --- */}
          <div>
            <h3 className="font-mono text-xs tracking-wide text-accent uppercase">
              {dict.demo.stagesTitle}
            </h3>

            <ol className="mt-6">
              {dict.demo.stages.map((stage, i) => (
                <li key={stage.title} className="relative pb-7 pl-9 last:pb-0">
                  {/* La línea que conecta las etapas: es un flujo, no una lista. */}
                  {i < dict.demo.stages.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-7 bottom-0 left-[0.6875rem] w-px bg-border"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 left-0 flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border border-border bg-surface font-mono text-[0.625rem] text-subtle tnum"
                  >
                    {i + 1}
                  </span>
                  <Reveal delay={i * 60}>
                    <h4 className="text-sm font-semibold text-fg text-pretty">{stage.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{stage.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          {/* --- Un intercambio real, del perfil --- */}
          <Reveal delay={80}>
            <div className="rounded-lg border border-border bg-surface/60 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
                  {dict.demo.exampleTitle}
                </h3>
                <span className="font-mono text-[0.625rem] text-subtle">{dict.demo.exampleNote}</span>
              </div>
              <div className="mt-5 space-y-5">
                {dict.demo.example.map((exchange) => (
                  <div key={exchange.q}>
                    <p className="text-sm font-medium text-fg text-pretty">{exchange.q}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{exchange.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* --- Por qué enseñar el flujo, y el código que ya se puede leer --- */}
        <Reveal>
          <div className="mt-12 border-t border-border pt-10 sm:mt-14">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] sm:gap-12">
              <div>
                <h3 className="font-mono text-xs tracking-wide text-accent uppercase">
                  {dict.demo.whyTitle}
                </h3>
                <p className="mt-4 leading-relaxed text-fg text-pretty">{dict.demo.why}</p>
              </div>

              <div className="sm:pt-7">
                <a
                  href={CV_AGENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover"
                >
                  {dict.demo.ctaRepo}
                  <span aria-hidden="true">↗</span>
                </a>
                <p className="mt-3 text-xs leading-relaxed text-subtle text-pretty">
                  {dict.demo.ctaRepoNote}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* --- Lo que ya está construido, con su evidencia --- */}
        <div className="mt-12">
          <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
            {dict.demo.architectureTitle}
          </h3>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {dict.demo.architecture.map((item, i) => (
              <li key={item.title} className="bg-bg p-5">
                <Reveal delay={i * 50}>
                  <h4 className="text-sm font-semibold text-fg text-pretty">{item.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted text-pretty">{item.body}</p>
                  <p className="mt-3">
                    <Evidence cite={item.cite} />
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
