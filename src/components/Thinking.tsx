import type { Dictionary } from "@/content/dictionary";
import SectionHeading from "./SectionHeading";
import SourceLink from "./SourceLink";
import { Stagger, StaggerItem } from "./Reveal";

/**
 * Cómo pienso: tres modos de falla resueltos.
 *
 * Eran cinco y cuatro venían del agente de CV, que era justo el problema de
 * la versión anterior. Ahora hay uno por frente: la investigación, la
 * producción en Dalton, y el agente. La trazabilidad va en hover.
 */
export default function Thinking({ dict }: { dict: Dictionary }) {
  return (
    <section id="thinking" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={dict.thinking.eyebrow}
          title={dict.thinking.title}
          intro={dict.thinking.intro}
        />

        <Stagger as="ol" className="mt-10 grid gap-6 lg:grid-cols-3" step={0.07}>
          {dict.thinking.items.map((item) => (
            <StaggerItem
              key={item.id}
              id={item.id}
              className="group relative scroll-mt-24 rounded-lg border border-border bg-surface/40 p-6"
            >
              <h3 className="text-base font-semibold tracking-tight text-fg text-balance">{item.title}</h3>

              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                    {dict.thinking.symptom}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{item.symptom}</p>
                </div>
                <div>
                  <h4 className="font-mono text-[0.6875rem] tracking-wide text-accent uppercase">
                    {dict.thinking.fix}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{item.fix}</p>
                </div>
                <div>
                  <h4 className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                    {dict.thinking.lesson}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg text-pretty">{item.lesson}</p>
                </div>
              </div>

              {item.cites[0] && <SourceLink cite={item.cites[0]} />}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
