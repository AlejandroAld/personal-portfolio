import type { Dictionary } from "@/content/dictionary";
import type { Run } from "@/content/runs";
import { CONTEXT_BLOCKS } from "@/lib/map-graph";

/**
 * Bajo el capó: cómo funciona esta página.
 *
 * Es la única sala que habla de agentes, y cuelga del núcleo con una arista
 * punteada porque explica la página y no es parte del CV. Lo que el agente
 * hace de verdad —cargar el perfil completo al prompt, un bloque por sección
 * del YAML, sin recuperación— se cuenta con la corrida grabada: los tamaños
 * de bloque son los que contó el tokenizador sobre el texto exacto, y el
 * marcador muestra el id, los tokens y el tiempo de esa corrida. Sin
 * grabación no hay cifras, y se dice. Una sola columna: la ventana de
 * contexto y el marcador no miden lo mismo, y ninguna columna deja un hueco
 * al lado de la otra.
 */
export default function Hood({ dict, run }: { dict: Dictionary; run: Run }) {
  const blocks = run.context?.blocks ?? CONTEXT_BLOCKS.map((title) => ({ title, tokens: null as number | null, chars: null as number | null }));
  const maxTokens = Math.max(1, ...blocks.map((b) => b.tokens ?? 0));
  const nombreBloque = (title: string) => dict.context.blocks[title] ?? title;
  const fmt = new Intl.NumberFormat(dict.locale);
  const usage = run.response?.usage;
  const reasoning = usage?.output_tokens_details?.reasoning_tokens ?? 0;
  const ms = run.timeline_ms?.completed ?? null;

  return (
    <div className="max-w-3xl">
      <div>
        <h3 className="label">{dict.context.window}</h3>
        <ol className="context-window mt-4">
          {blocks.map((b, i) => (
            <li key={b.title} className="context-block">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-fg">{nombreBloque(b.title)}</span>
                <span className="shrink-0 font-mono text-micro text-subtle tnum">
                  {b.tokens === null ? dict.run.none : dict.context.tokens.replace("{n}", fmt.format(b.tokens))}
                </span>
              </div>
              <div className="context-track" aria-hidden="true">
                <div className="context-bar" style={{ width: `${b.tokens === null ? 0 : Math.max(2, (100 * b.tokens) / maxTokens)}%`, ["--i" as string]: i }} />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 font-mono text-micro leading-relaxed text-subtle">
          {run.context && usage
            ? dict.context.windowNote.replace("{tokenizer}", run.context.tokenizer).replace("{total}", fmt.format(usage.input_tokens))
            : dict.context.pendingBlocks}
        </p>
      </div>

      <div>
        <h3 className="label mt-10">{dict.run.title}</h3>
        {/* El marcador de la corrida: todo sale de la grabación. */}
        <dl className="marker mt-4">
          <div className="marker-row">
            <dt>{dict.run.run}</dt>
            <dd className="marker-id">{run.status === "recorded" && run.response ? run.response.id : dict.run.pending}</dd>
          </div>
          <div className="marker-row">
            <dt>{dict.run.model}</dt>
            <dd>{run.response?.model ?? dict.run.none}</dd>
          </div>
          <div className="marker-row">
            <dt>{dict.run.input}</dt>
            <dd className="tnum">{usage ? dict.run.tokens.replace("{n}", fmt.format(usage.input_tokens)) : dict.run.none}</dd>
          </div>
          <div className="marker-row">
            <dt>{dict.run.reasoning}</dt>
            <dd className="tnum">{usage ? dict.run.tokens.replace("{n}", fmt.format(reasoning)) : dict.run.none}</dd>
          </div>
          <div className="marker-row">
            <dt>{dict.run.output}</dt>
            <dd className="tnum">{usage ? dict.run.tokens.replace("{n}", fmt.format(usage.output_tokens - reasoning)) : dict.run.none}</dd>
          </div>
          <div className="marker-row">
            <dt>{dict.run.time}</dt>
            <dd className="tnum">{ms === null ? dict.run.none : `${(ms / 1000).toFixed(2)} s`}</dd>
          </div>
          <div className="marker-row">
            <dt>{dict.run.state}</dt>
            <dd>{run.status === "recorded" ? dict.run.done : dict.run.pending}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">{dict.run.note}</p>
        {run.status === "recorded" && run.output_text && (
          <blockquote className="mt-4 rounded-sm border-l-2 border-border-strong bg-card px-4 py-3 text-sm leading-relaxed text-muted text-pretty">
            {run.output_text}
          </blockquote>
        )}
        <p className="mt-4 font-mono text-micro leading-relaxed text-subtle">
          {dict.run.recordedFrom}{" "}
          <a href={`https://github.com/AlejandroAld/cv-agent/blob/${run.cv_agent_sha ?? "main"}/scripts/grabar_corrida.py`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 transition-colors hover:text-accent">
            scripts/grabar_corrida.py
          </a>
        </p>
      </div>
    </div>
  );
}
