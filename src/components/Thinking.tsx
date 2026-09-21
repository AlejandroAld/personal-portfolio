import type { Dictionary } from "@/content/dictionary";
import Evidence from "./Evidence";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Cómo pienso: modos de falla resueltos en producción.
 *
 * Nada de esto se despliega ni se esconde tras un botón. Es la sección que más
 * dice sobre cómo trabajo, así que se lee de corrido: qué se rompió, qué hice,
 * y a qué generaliza. Cada una enlaza a la línea exacta.
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

        <ol className="mt-12 space-y-12">
          {dict.thinking.items.map((item, i) => (
            <li key={item.id} id={item.id} className="scroll-mt-24">
              <Reveal>
                <article className="grid gap-6 border-l-2 border-border pl-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 sm:border-l-0 sm:pl-0">
                  <div className="sm:w-32">
                    <span className="font-mono text-xs text-subtle tnum">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-fg text-balance">
                      {item.title}
                    </h3>

                    <div className="mt-5 space-y-5">
                      <div>
                        <h4 className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                          {dict.thinking.symptom}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                          {item.symptom}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-mono text-[0.6875rem] tracking-wide text-accent uppercase">
                          {dict.thinking.fix}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                          {item.fix}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                          {dict.thinking.lesson}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-fg text-pretty">
                          {item.lesson}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
                      <span className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                        {dict.thinking.evidence}
                      </span>
                      {item.cites.map((cite) => (
                        <Evidence key={cite} cite={cite} />
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
