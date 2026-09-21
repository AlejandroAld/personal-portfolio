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

import type { Locale } from "@/content/dictionary";

export interface ChatStrings {
  launch: string;
  placeholder: string;
  send: string;
  sending: string;
  suggestionsLabel: string;
  suggestions: readonly string[];
  you: string;
  agent: string;
  thinking: string;
  reset: string;
  liveLabel: string;
  errorGeneric: string;
  errorRateLimit: string;
  errorOffline: string;
  transcriptLabel: string;
  disclaimer: string;
}

/**
 * Las cadenas viven aquí y no en el diccionario porque la demo no está
 * publicada: mantener un bloque muerto en los dos archivos de contenido sería
 * ruido para quien los edita. Al publicarla, o se mueven al diccionario o se
 * usan tal cual desde aquí; en ninguno de los dos casos hay que reescribirlas.
 */
export const CHAT_STRINGS: Record<Locale, ChatStrings> = {
  en: {
    launch: "Start the conversation",
    placeholder: "Ask about experience, stack, or a specific role…",
    send: "Send",
    sending: "Sending",
    suggestionsLabel: "Try one of these",
    suggestions: [
      "What can't you do?",
      "Do you have experience integrating with a banking core?",
      "Evaluate me against this role: Kubernetes, Terraform, banking core",
      "What's the most expensive technical mistake you've made?",
    ],
    you: "You",
    agent: "Agent",
    thinking: "Thinking",
    reset: "Start over",
    liveLabel: "Live",
    errorGeneric: "The agent couldn't answer. Try again in a moment.",
    errorRateLimit:
      "You've hit the hourly limit for this public demo. It's capped per IP because a web page can't hold a credential — the cost, not the identity, is what gets protected.",
    errorOffline: "The agent is unreachable right now.",
    transcriptLabel: "Conversation with the CV agent",
    disclaimer:
      "The demo endpoint takes no credential and is rate-limited per IP. The Bearer-protected endpoint is for Open Responses clients, not for this page.",
  },
  es: {
    launch: "Empezar la conversación",
    placeholder: "Pregunta por experiencia, stack o una vacante concreta…",
    send: "Enviar",
    sending: "Enviando",
    suggestionsLabel: "Prueba con una de estas",
    suggestions: [
      "¿Qué no sabes hacer?",
      "¿Tienes experiencia integrando con un core bancario?",
      "Evalúa mi vacante: Kubernetes, Terraform, core bancario",
      "¿Cuál ha sido tu error técnico más caro?",
    ],
    you: "Tú",
    agent: "Agente",
    thinking: "Pensando",
    reset: "Empezar de nuevo",
    liveLabel: "En vivo",
    errorGeneric: "El agente no pudo responder. Inténtalo en un momento.",
    errorRateLimit:
      "Llegaste al límite por hora de esta demo pública. Está topada por IP porque una página web no puede guardar una credencial: lo que se protege es el costo, no la identidad.",
    errorOffline: "El agente no responde ahora mismo.",
    transcriptLabel: "Conversación con el agente de CV",
    disclaimer:
      "El endpoint de la demo no lleva credencial y está limitado por IP. El endpoint protegido por Bearer es para clientes de Open Responses, no para esta página.",
  },
};

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
              {strings.suggestions.map((s: string) => (
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
