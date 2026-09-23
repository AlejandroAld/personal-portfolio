/**
 * Dónde va la lectura, como progreso de la corrida.
 *
 * Un solo observador del scroll para el marcador, el escenario 3D y el
 * diagrama: mide las secciones con `data-step` y publica el paso actual (1–6)
 * y cuánto de él va recorrido (0–1). El paso activo es el último cuya parte
 * superior ya cruzó el 45 % del viewport; lo que hay entre dos pasos cuenta
 * como el final del anterior.
 *
 * Se lee con useSyncExternalStore; sin JS no hay progreso y la página se queda
 * en el paso 1, que es lo que el HTML del servidor describe.
 */

import { useSyncExternalStore } from "react";
import { STEPS } from "./agent-graph";

export interface RunProgress {
  readonly step: number;
  readonly t: number;
  /** step + t, para animar de corrido. */
  readonly value: number;
}

const LINE = 0.45;
const INITIAL: RunProgress = { step: 1, t: 0, value: 1 };

let current: RunProgress = INITIAL;
const listeners = new Set<() => void>();
let bound = false;
let frame = 0;

function measure(): RunProgress {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
  if (!sections.length) return INITIAL;
  const line = window.innerHeight * LINE;
  let step = 1;
  let t = 0;
  for (const el of sections) {
    const n = Number(el.dataset.step);
    const r = el.getBoundingClientRect();
    if (r.top <= line) {
      step = n;
      t = Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height)));
    }
  }
  // El último paso cierra cuando el final de la página entra en pantalla.
  if (step === STEPS) {
    const end = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    if (end < 4) t = 1;
  }
  return { step, t, value: step + t };
}

function schedule() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    const next = measure();
    if (next.step !== current.step || Math.abs(next.t - current.t) > 0.002) {
      current = next;
      listeners.forEach((l) => l());
    }
  });
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  bind();
  return () => {
    listeners.delete(listener);
  };
}

export function getProgress(): RunProgress {
  return current;
}

export function useRunProgress(): RunProgress {
  return useSyncExternalStore(subscribeProgress, getProgress, () => INITIAL);
}
