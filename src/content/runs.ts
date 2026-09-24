/**
 * Las corridas grabadas del agente, una por idioma.
 *
 * La página cuenta su recorrido como la ejecución del agente de CV
 * respondiendo "¿Quién es Alex y por qué debería contratarlo?". Nada corre
 * en vivo: lo que se ve es una grabación hecha con
 * `scripts/grabar_corrida.py` del repo del agente, contra el agente
 * desplegado, y cada número que la página muestra —tokens, tiempos, id de la
 * corrida, herramientas— sale de ese JSON. Si un dato no está en la
 * grabación, no se muestra.
 *
 * Mientras una corrida está `pending`, la página lo dice: no hay marcador
 * con cifras ni respuesta reproducida. `scripts/check-runs.mjs` valida la
 * forma de los dos archivos en cada `npm run lint`.
 */

import en from "./runs/en.json";
import es from "./runs/es.json";
import type { Locale } from "./dictionary";

export interface RunUsage {
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly total_tokens: number;
  readonly input_tokens_details?: { readonly cached_tokens: number };
  readonly output_tokens_details?: { readonly reasoning_tokens: number };
}

export interface RunEvent {
  readonly t_ms: number;
  readonly type: string;
  readonly seq?: number | null;
  readonly delta?: string;
  readonly item_type?: string | null;
  readonly name?: string | null;
}

export interface RunContextBlock {
  readonly title: string;
  readonly chars: number;
  readonly tokens: number;
}

export interface Run {
  readonly schema: 1;
  readonly status: "recorded" | "pending";
  readonly language: Locale;
  readonly question: string;
  readonly recorded_at: string | null;
  readonly cv_agent_sha: string | null;
  readonly endpoint: string;
  readonly recorder: string;
  readonly response: {
    readonly id: string;
    readonly model: string | null;
    readonly status: string;
    readonly created_at: number;
    readonly completed_at: number | null;
    readonly usage: RunUsage | null;
    readonly metadata: Readonly<Record<string, string>>;
  } | null;
  readonly timeline_ms: {
    readonly created: number | null;
    readonly first_token: number | null;
    readonly last_token: number | null;
    readonly completed: number | null;
  } | null;
  readonly tool_calls: {
    readonly reported: boolean;
    readonly count: number | null;
    readonly names: readonly string[] | null;
    readonly ms: readonly number[] | null;
  } | null;
  readonly events: readonly RunEvent[];
  readonly output_text: string;
  readonly context: {
    readonly tokenizer: string;
    readonly blocks: readonly RunContextBlock[];
    readonly profile_tokens: number;
    readonly template_tokens: number;
    readonly tools_schema_tokens: number;
    readonly tool_names: readonly string[];
    readonly question_tokens: number;
  } | null;
}

const RUNS: Readonly<Record<Locale, Run>> = { en: en as Run, es: es as Run };

export function getRun(locale: Locale): Run {
  return RUNS[locale];
}

/** Los tokens de razonamiento, sólo si la corrida los reporta. */
export function reasoningTokens(run: Run): number | null {
  const n = run.response?.usage?.output_tokens_details?.reasoning_tokens;
  return typeof n === "number" ? n : null;
}
