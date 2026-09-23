import type { Dictionary } from "@/content/dictionary";
import SectionHeading from "./SectionHeading";
import SourceLink from "./SourceLink";

/**
 * Cómo pienso: tres modos de falla resueltos.
 *
 * Eran cinco y cuatro venían del agente de CV, que era justo el problema de
 * la versión anterior. Ahora hay uno por frente: la investigación, la
 * producción en Dalton, y el agente. Cada tarjeta cierra con su cita.
 */
export default function Thinking({ dict }: { dict: Dictionary }) {
  return (
    <section id="thinking" data-step="4" className="section">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={dict.thinking.eyebrow}
          title={dict.thinking.title}
          intro={dict.thinking.intro}
        />

        <ol className="mt-heading grid gap-6 lg:grid-cols-3">
          {dict.thinking.items.map((item) => (
            <li key={item.id} id={item.id} className="card p-6">
              <h3 className="text-base font-semibold tracking-tight text-fg text-balance">{item.title}</h3>

              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="label">
                    {dict.thinking.symptom}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{item.symptom}</p>
                </div>
                <div>
                  <h4 className="label text-accent">
                    {dict.thinking.fix}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{item.fix}</p>
                </div>
                <div>
                  <h4 className="label">
                    {dict.thinking.lesson}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg text-pretty">{item.lesson}</p>
                </div>
              </div>

              {item.cites[0] && (
                <SourceLink cite={item.cites[0]} ariaLabel={dict.footer.sourceAria} className="mt-5" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
