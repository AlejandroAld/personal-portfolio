import type { Dictionary } from "@/content/dictionary";
import { educacion, educacionPeriodo, perfil, persona, term } from "@/content/perfil";
import type { Run } from "@/content/runs";
import { CONTEXT_BLOCKS, STEPS } from "@/lib/agent-graph";
import SectionHeading from "./SectionHeading";
import SourceLink from "./SourceLink";

/**
 * Paso 2 · Contexto: formación e idiomas, y la ventana de contexto.
 *
 * Lo que el agente hace en este paso es cargar el perfil completo al prompt
 * (core.py, como_contexto): un bloque por sección del YAML, sin recuperación.
 * La lista de bloques de la derecha es esa estructura; los tamaños son los que
 * grabó la corrida, contados con el tokenizador sobre el texto exacto. Si la
 * corrida no está grabada, no hay cifras, y se dice.
 *
 * La formación lleva el contexto del ingreso con sus dos fuentes, que están en
 * el YAML como datos y no como adorno.
 */
export default function Context({ dict, run }: { dict: Dictionary; run: Run }) {
  const { years, gpa } = educacionPeriodo();
  const stepLabel = dict.run.stepLabel.replace("{n}", "2").replace("{total}", String(STEPS));
  const blocks = run.context?.blocks ?? CONTEXT_BLOCKS.map((title) => ({ title, tokens: null as number | null, chars: null as number | null }));
  const maxTokens = Math.max(1, ...blocks.map((b) => b.tokens ?? 0));
  const nombreBloque = (title: string) => dict.context.blocks[title] ?? title;
  const contexto = dict.context.contextLine ?? educacion.contexto;
  const fmt = new Intl.NumberFormat(dict.locale);

  return (
    <section id="context" data-step="2" className="section">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={`${stepLabel} · ${dict.run.stepNames[1]}`} title={dict.context.title} intro={dict.context.intro} />

        <div className="mt-heading grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <h3 className="label">{dict.context.education}</h3>
            <p className="mt-4 text-base font-semibold text-fg">{term(educacion.titulo, dict)}</p>
            <p className="mt-1 text-sm text-muted">{educacion.institucion}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-subtle">
              <span className="tnum">{years}</span>
              {gpa && (
                <span className="badge tnum">
                  {dict.certifications.gpa} {gpa}
                </span>
              )}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted text-pretty">{contexto}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-micro text-subtle">
              <span>{dict.context.sources}:</span>
              {educacion.fuentes.map((f) => (
                <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 transition-colors hover:text-accent">
                  {term(f.descripcion, dict)}
                </a>
              ))}
            </p>
            <SourceLink cite="educationContext" ariaLabel={dict.footer.sourceAria} className="mt-2" />

            <h3 className="label mt-10">{dict.context.languages}</h3>
            <ul className="mt-4 space-y-2">
              {persona.idiomas.map((i) => (
                <li key={i.idioma} className="text-sm leading-relaxed text-muted">
                  <span className="font-medium text-fg">{term(i.idioma, dict)}</span> · {term(i.nivel, dict)}
                </li>
              ))}
            </ul>

            <h3 className="label mt-10">{dict.context.certifications}</h3>
            <ul className="mt-4 space-y-2">
              {perfil.certificaciones.map((cert) => (
                <li key={cert.nombre} className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border px-3 py-2.5">
                  <span className="text-sm text-muted text-pretty">{cert.nombre}</span>
                  <span className="badge shrink-0">{dict.certifications.inProgress}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="label">{dict.context.window}</h3>
            <ol className="context-window mt-4">
              {blocks.map((b, i) => (
                <li key={b.title} className="context-block">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-fg">{nombreBloque(b.title)}</span>
                    <span className="shrink-0 font-mono text-micro text-subtle tnum">
                      {b.tokens === null ? "—" : dict.context.tokens.replace("{n}", fmt.format(b.tokens))}
                    </span>
                  </div>
                  <div className="context-track" aria-hidden="true">
                    <div
                      className="context-bar"
                      style={{ width: `${b.tokens === null ? 0 : Math.max(2, (100 * b.tokens) / maxTokens)}%`, ["--i" as string]: i }}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 font-mono text-micro leading-relaxed text-subtle">
              {run.context && run.response?.usage
                ? dict.context.windowNote.replace("{tokenizer}", run.context.tokenizer).replace("{total}", fmt.format(run.response.usage.input_tokens))
                : dict.context.pendingBlocks}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
