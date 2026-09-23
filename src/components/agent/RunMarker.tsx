"use client";

import { useEffect, useRef, useState } from "react";
import type { Run } from "@/content/runs";
import { cubicBezier } from "@/lib/bezier";
import { STEPS } from "@/lib/agent-graph";
import { useRunProgress } from "@/lib/run-progress";
import { EASE_OUT } from "@/lib/tokens";

/**
 * El marcador de la corrida: fijo arriba, en monoespaciada, discreto.
 *
 * Todo lo que muestra sale de la grabación: el id, los tokens acumulados y el
 * tiempo son los de esa corrida, repartidos por paso como ocurrieron —la
 * entrada se carga en el paso 2, el razonamiento en el 4, la salida en el 6—.
 * Sin grabación no hay cifras: lo dice y ya.
 *
 * Para lectores de pantalla sólo se anuncia el cambio de paso; los números
 * cambiando cada pocos píxeles serían ruido.
 */

export interface MarkerCopy {
  readonly pending: string;
  readonly run: string;
  readonly stepOf: string; // "paso {n} de {total}"
  readonly tokens: string;
  readonly running: string;
  readonly done: string;
  readonly stepNames: readonly string[];
  readonly announce: string; // "Paso {n} de {total}: {name}"
}

const ease = cubicBezier(...EASE_OUT);

function accumulated(run: Run, step: number): { tokens: number; ms: number } {
  const u = run.response?.usage;
  const tl = run.timeline_ms;
  if (!u || !tl) return { tokens: 0, ms: 0 };
  const reasoning = u.output_tokens_details?.reasoning_tokens ?? 0;
  const output = u.output_tokens - reasoning;
  let tokens = 0;
  let ms = 0;
  if (step >= 2) {
    tokens += u.input_tokens;
    ms = tl.created ?? 0;
  }
  if (step >= 3) ms = tl.first_token ?? ms;
  if (step >= 4) tokens += reasoning;
  if (step >= 6) {
    tokens += output;
    ms = tl.completed ?? ms;
  }
  return { tokens, ms };
}

function useTween(target: number, duration = 500): number {
  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    if (reduced) {
      // Sin animación: el valor final, en el siguiente cuadro.
      frame = requestAnimationFrame(() => {
        fromRef.current = target;
        setShown(target);
      });
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const v = Math.round(from + ease(k) * (target - from));
      setShown(v);
      if (k < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return shown;
}

export default function RunMarker({ run, copy, locale }: { run: Run; copy: MarkerCopy; locale: string }) {
  const { step } = useRunProgress();
  const recorded = run.status === "recorded" && run.response;
  const acc = accumulated(run, step);
  const tokens = useTween(acc.tokens);
  const ms = useTween(acc.ms);
  const fmt = new Intl.NumberFormat(locale);
  const shortId = run.response?.id ? run.response.id.slice(0, 12) + "…" : "";
  const done = step >= STEPS;

  // Se refleja en <html> para que el diagrama SVG (sin JS de escena) resalte el paso.
  useEffect(() => {
    document.documentElement.dataset.runStep = String(step);
  }, [step]);

  const stepLabel = copy.stepOf.replace("{n}", String(step)).replace("{total}", String(STEPS));
  return (
    <div className="marker" role="status" aria-live="off">
      <span className="marker-inner" aria-hidden="true">
        {recorded ? (
          <>
            <span className="marker-id">{copy.run} {shortId}</span>
            <span className="marker-sep">·</span>
            <span>{stepLabel}</span>
            <span className="marker-sep">·</span>
            <span className="tnum">{fmt.format(tokens)} {copy.tokens}</span>
            <span className="marker-sep">·</span>
            <span className="tnum">{(ms / 1000).toFixed(1)} s</span>
            <span className="marker-sep">·</span>
            <span className={done ? "text-accent" : undefined}>{done ? copy.done : copy.running}</span>
          </>
        ) : (
          <>
            <span>{copy.pending}</span>
            <span className="marker-sep">·</span>
            <span>{stepLabel}</span>
          </>
        )}
      </span>
      <p className="sr-only" aria-live="polite">
        {copy.announce.replace("{n}", String(step)).replace("{total}", String(STEPS)).replace("{name}", copy.stepNames[step - 1] ?? "")}
      </p>
    </div>
  );
}
