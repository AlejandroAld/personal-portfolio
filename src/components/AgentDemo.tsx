"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ChatStrings } from "./AgentChat";

/**
 * Carga diferida del chat. NO PUBLICADO TODAVÍA: ver la nota de AgentChat.tsx.
 *
 *
 * El cliente del agente no entra al bundle inicial: se importa cuando alguien
 * decide usarlo. Así la portada no paga streaming, parser SSE ni estado de
 * conversación para un visitante que sólo venía a leer, que es lo que mantiene
 * el camino crítico corto en móvil.
 *
 * El hueco reserva la misma altura que el panel cargado, así que abrirlo no
 * mueve nada de lo que ya estaba en pantalla.
 */

const AgentChat = dynamic(() => import("./AgentChat"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[19rem] animate-pulse rounded-lg border border-border bg-surface" />
  ),
});

export default function AgentDemo({
  endpoint,
  strings,
}: {
  endpoint: string;
  strings: ChatStrings;
}) {
  const [started, setStarted] = useState(false);

  if (started) return <AgentChat endpoint={endpoint} strings={strings} />;

  return (
    <div className="flex min-h-[19rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center">
      <p className="max-w-sm text-sm text-muted">{strings.suggestionsLabel}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {strings.suggestions.slice(0, 3).map((s: string) => (
          <li key={s}>
            <span className="inline-block rounded border border-border px-2.5 py-1 text-xs text-subtle">
              {s}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="mt-1 inline-flex items-center gap-2 rounded bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover"
      >
        {strings.launch}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
