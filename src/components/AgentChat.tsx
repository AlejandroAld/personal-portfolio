"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

/**
 * Cliente del agente de CV. NO PUBLICADO TODAVÍA.
 *
 * Este archivo está escrito, probado y deliberadamente fuera del bundle:
 * DemoSection no lo importa, así que Next no lo incluye en ningún chunk
 * servido. Se conserva aquí, y no en una rama aparte, porque el trabajo ya
 * está hecho y verificado —ver tests/agent-demo/— y perderlo para volver a
 * escribirlo el día del lanzamiento sería tirar esa verificación.
 *
 * Para publicarlo: importar AgentDemo desde DemoSection y pasarle
 * `dict.demo.chat` con AGENT_CHAT_ENDPOINT. Nada más; las cadenas ya están en
 * el diccionario, completas y en los dos idiomas.
 *
 * ARQUITECTURA (opción A del plan): el navegador habla DIRECTO con `/api/chat`
 * del agente desplegado. No hay proxy y no hay credencial en ninguna parte.
 *
 * El endpoint Bearer `/v1/responses` no se toca desde aquí: una página web no
 * puede guardar una llave en secreto, así que la demo no se protege por
 * identidad sino por consumo, con un tope por IP en el backend. Un proxy
 * intermedio sería peor, no mejor: todas las peticiones saldrían con la IP del
 * servidor y el tope por IP se volvería un cubo global para todo el sitio.
 *
 * `/api/chat` es SIN ESTADO: descarta `previous_response_id` y reconstruye la
 * petición con `input`, `stream` y `max_output_tokens`. Por eso el cliente
 * reenvía la transcripción completa en cada turno.
 */

import type { Dictionary } from "@/content/dictionary";

/**
 * Las cadenas salen del diccionario, no de una interfaz paralela: así el
 * contenido y el cliente no pueden desincronizarse mientras la demo espera.
 */
export type ChatStrings = Dictionary["demo"]["chat"];

const MAX_CHARS = 1200;

type Turn = { role: "user" | "assistant"; text: string };

/** Los items que espera el endpoint, en el formato de Open Responses. */
function toInput(turns: Turn[]) {
  return turns.map((t) => ({
    role: t.role,
    content: [
      { type: t.role === "assistant" ? "output_text" : "input_text", text: t.text },
    ],
  }));
}

export default function AgentChat({
  endpoint,
  strings,
}: {
  endpoint: string;
  strings: ChatStrings;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Una petición en vuelo no debe sobrevivir a la salida del componente.
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim().slice(0, MAX_CHARS);
      if (!text || busy) return;

      setError(null);
      setDraft("");
      setBusy(true);

      const history: Turn[] = [...turns, { role: "user", text }];
      setTurns([...history, { role: "assistant", text: "" }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: toInput(history) }),
          credentials: "omit",
          signal: controller.signal,
        });

        if (resp.status === 429) {
          setTurns(history);
          setError(strings.errorRateLimit);
          return;
        }
        if (!resp.ok || !resp.body) {
          setTurns(history);
          setError(strings.errorGeneric);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";
        let failed = false;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Los eventos SSE se separan por línea en blanco. Lo que queda tras
          // el último separador es un evento a medias: se guarda para la
          // siguiente vuelta en vez de intentar parsearlo.
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            const data = block
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trim())
              .join("\n");
            if (!data || data === "[DONE]") continue;

            let event: { type?: string; delta?: string };
            try {
              event = JSON.parse(data);
            } catch {
              continue;
            }

            if (event.type === "response.output_text.delta" && event.delta) {
              answer += event.delta;
              setTurns([...history, { role: "assistant", text: answer }]);
            } else if (event.type === "error") {
              failed = true;
            }
          }
        }

        if (failed || !answer) {
          setTurns(history);
          setError(strings.errorGeneric);
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setTurns(history);
        setError(strings.errorOffline);
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, endpoint, strings, turns],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  const reset = () => {
    abortRef.current?.abort();
    setTurns([]);
    setError(null);
    setDraft("");
    inputRef.current?.focus();
  };

  const streaming = busy && turns.at(-1)?.role === "assistant" && turns.at(-1)?.text === "";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <p className="flex items-center gap-2 font-mono text-xs text-muted">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${busy ? "bg-accent" : "bg-emerald-400"}`}
            aria-hidden="true"
          />
          {strings.liveLabel}
        </p>
        {turns.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="font-mono text-xs text-subtle transition-colors hover:text-fg"
          >
            {strings.reset}
          </button>
        )}
      </div>

      <div
        ref={logRef}
        className="max-h-[22rem] min-h-[11rem] space-y-4 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-label={strings.transcriptLabel}
      >
        {turns.length === 0 && !error && (
          <div>
            <p className="font-mono text-xs text-subtle">{strings.suggestionsLabel}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {strings.suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => void ask(s)}
                    className="w-full rounded border border-border px-3 py-2 text-left text-sm text-muted transition-colors hover:border-accent/50 hover:text-fg"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i}>
            <p className="font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
              {turn.role === "user" ? strings.you : strings.agent}
            </p>
            <p
              className={`mt-1 text-sm leading-relaxed whitespace-pre-wrap ${
                turn.role === "user" ? "text-fg" : "text-muted"
              }`}
            >
              {turn.text || (streaming ? `${strings.thinking}…` : "")}
            </p>
          </div>
        ))}

        {error && (
          <p role="alert" className="rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs leading-relaxed text-amber-200/90">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-border px-4 py-3">
        <label htmlFor="agent-input" className="sr-only">
          {strings.placeholder}
        </label>
        <input
          id="agent-input"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          placeholder={strings.placeholder}
          disabled={busy}
          autoComplete="off"
          className="min-w-0 flex-1 rounded border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-subtle disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="shrink-0 rounded bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? strings.sending : strings.send}
        </button>
      </form>
    </div>
  );
}
