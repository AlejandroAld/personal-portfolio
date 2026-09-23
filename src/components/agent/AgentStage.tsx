"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentType } from "react";
import AgentDiagram from "./AgentDiagram";

/**
 * El escenario: un solo lienzo fijo detrás de toda la página.
 *
 * Empieza siempre con el diagrama SVG, que viene en el HTML del servidor. El
 * escenario WebGL se carga después del LCP, en su propio chunk, y sólo si el
 * navegador tiene WebGL y la persona no pidió movimiento reducido; cuando
 * pinta su primer cuadro, el SVG se apaga. Nunca hay dos contextos WebGL a la
 * vez: el shader del héroe se fue con esta pieza.
 */

const AgentScene = dynamic(() => import("./AgentScene"), { ssr: false }) as ComponentType<{ onReady: () => void; mobile: boolean }>;

function canRun3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function AgentStage() {
  const [mode, setMode] = useState<"svg" | "loading" | "3d">("svg");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    // Después del LCP: al ocio del navegador, ya con la página pintada.
    const start = () => {
      setMobile(window.matchMedia("(max-width: 767px)").matches);
      setMode("loading");
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 1200);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <div className={mode === "3d" ? "stage-svg stage-svg-off" : "stage-svg"}>
        <AgentDiagram />
      </div>
      {mode !== "svg" && <AgentScene mobile={mobile} onReady={() => setMode("3d")} />}
    </div>
  );
}
