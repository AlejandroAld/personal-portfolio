import type { Dictionary } from "@/content/dictionary";
import { AGENT_CHAT_ENDPOINT } from "@/lib/site";
import AgentDemo from "./AgentDemo";
import Evidence from "./Evidence";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * El proyecto héroe: el agente, probándose en la página.
 *
 * El intercambio guardado se renderiza siempre, en el servidor. No es un
 * respaldo que aparece cuando algo falla: es contenido que un buscador indexa y
 * que alguien de reclutamiento puede leer sin pulsar nada. Cuando el agente no
 * contesta —porque topó el límite por IP o porque está caído— el error apunta
 * aquí, y la sección nunca se ve rota.
 *
 * Las respuestas guardadas son las que el propio perfil fija para esas
 * preguntas. No se redactó ninguna para esta página.
 */
export default function DemoSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="agent" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.demo.eyebrow} title={dict.demo.title} intro={dict.demo.intro} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
          <Reveal>
            <AgentDemo
              endpoint={AGENT_CHAT_ENDPOINT}
              launch={dict.demo.launch}
              strings={{
                placeholder: dict.demo.placeholder,
                send: dict.demo.send,
                sending: dict.demo.sending,
                suggestionsLabel: dict.demo.suggestionsLabel,
                suggestions: dict.demo.suggestions,
                you: dict.demo.you,
                agent: dict.demo.agent,
                thinking: dict.demo.thinking,
                reset: dict.demo.reset,
                liveLabel: dict.demo.liveLabel,
                errorGeneric: dict.demo.errorGeneric,
                errorRateLimit: dict.demo.errorRateLimit,
                errorOffline: dict.demo.errorOffline,
                transcriptLabel: dict.demo.transcriptLabel,
              }}
            />
            <p className="mt-3 text-xs leading-relaxed text-subtle">
              {dict.demo.disclaimer} <Evidence cite="demoRateLimit" />
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-lg border border-border bg-surface/60 p-5">
              <p className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                {dict.demo.fallbackNote}
              </p>
              <div className="mt-4 space-y-5">
                {dict.demo.fallback.map((exchange) => (
                  <div key={exchange.q}>
                    <p className="text-sm font-medium text-fg">{exchange.q}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">
                      {exchange.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* --- Qué está viendo quien prueba el agente --- */}
        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {dict.demo.architecture.map((item, i) => (
            <li key={item.title} className="bg-bg p-5">
              <Reveal delay={i * 50}>
                <h3 className="text-sm font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted text-pretty">{item.body}</p>
                <p className="mt-3">
                  <Evidence cite={item.cite} />
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
