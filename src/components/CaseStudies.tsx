import type { Dictionary } from "@/content/dictionary";
import { proyecto, terms } from "@/content/perfil";
import CaseStudyCard from "./CaseStudyCard";
import Evidence from "./Evidence";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((tag) => (
        <li
          key={tag}
          className="rounded border border-border px-2 py-1 font-mono text-[0.6875rem] text-subtle"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <h4 className="font-mono text-[0.6875rem] tracking-wide text-accent uppercase">{label}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{body}</p>
    </div>
  );
}

/**
 * Casos de estudio, no tarjetas.
 *
 * Cada uno responde lo mismo: qué problema había, qué decidí y por qué, y qué
 * resultado medible dejó. El stack sale de perfil.json —no se reescribe aquí—
 * y se traduce sólo si el diccionario cubre el término; los nombres propios de
 * tecnología pasan tal cual.
 */
export default function CaseStudies({ dict }: { dict: Dictionary }) {
  return (
    <section id="cases" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.cases.eyebrow} title={dict.cases.title} intro={dict.cases.intro} />

        <div className="mt-10">
          {dict.cases.items.map((item) => {
            const stack = item.stack ?? proyecto(item.perfilId ?? "")?.stack ?? [];

            return (
              <CaseStudyCard
                key={item.id}
                title={item.title}
                kicker={item.kicker}
                labels={{ expand: dict.cases.expand, collapse: dict.cases.collapse }}
              >
                <div className="grid gap-6 sm:grid-cols-3">
                  <Block label={dict.cases.problem} body={item.problem} />
                  <Block label={dict.cases.decision} body={item.decision} />
                  <Block label={dict.cases.result} body={item.result} />
                </div>

                <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
                  <div className="min-w-0">
                    <h4 className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                      {dict.cases.stack}
                    </h4>
                    <div className="mt-2">
                      <Tags items={terms(stack, dict)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Evidence cite={item.cite} />
                    {item.repo ? (
                      <a
                        href={item.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-accent transition-colors hover:text-accent-soft"
                      >
                        {dict.cases.viewCode} ↗
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-subtle">{dict.cases.privateCode}</span>
                    )}
                  </div>
                </div>
              </CaseStudyCard>
            );
          })}
        </div>

        {/* --- Lo demás, en breve --- */}
        <div className="mt-14">
          <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
            {dict.cases.alsoTitle}
          </h3>
          <ul className="mt-5 grid gap-6 sm:grid-cols-2">
            {dict.cases.also.map((item, i) => (
              <li key={item.title}>
                <Reveal delay={i * 60}>
                  <h4 className="text-sm font-semibold text-fg">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{item.body}</p>
                  <p className="mt-2.5">
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
