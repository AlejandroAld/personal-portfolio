"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentType } from "react";
import { fallbackToCv, useExplorer } from "@/lib/explorer";
import MapDiagram from "./MapDiagram";

/**
 * El escenario: un solo lienzo fijo, en el umbral y en modo explorar.
 *
 * Empieza con el mapa en SVG, que viene en el HTML del servidor; en el umbral
 * es lo que se ve dentro del marco de la derecha mientras el 3D carga. El
 * escenario WebGL se carga después del LCP, en su propio chunk, y cuando
 * pinta su primer cuadro el SVG se apaga. Es el mismo lienzo que luego ocupa
 * la pantalla completa: al elegir no se vuelve a cargar nada. Sin WebGL la
 * página pasa a Modo CV. En Modo CV el lienzo se desmonta —no hay ningún
 * contexto WebGL vivo— y al volver a explorar se vuelve a cargar. Nunca hay
 * dos contextos a la vez. Con movimiento reducido el 3D sí carga, pero sin
 * vuelos ni caídas.
 */

const MapScene = dynamic(() => import("./MapScene"), { ssr: false }) as ComponentType<{ onReady: () => void }>;

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
    // El contexto de prueba se suelta enseguida: el único que vive es el del lienzo.
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function MapStage() {
  const { mode } = useExplorer({ node: null, sub: null });
  const [phase, setPhase] = useState<"svg" | "loading" | "3d">("svg");
  const wanted = mode === "explore" || mode === "threshold";

  useEffect(() => {
    if (!wanted) {
      // Modo CV: fuera el lienzo. Al volver, se carga de nuevo.
      const t = window.setTimeout(() => setPhase("svg"), 0);
      return () => window.clearTimeout(t);
    }
    // Después del LCP: al ocio del navegador, ya con la página pintada.
    const start = () => {
      const m = document.documentElement.dataset.mode;
      if (m !== "explore" && m !== "threshold") return;
      if (!hasWebGL()) {
        // El script de <head> ya lo decidió; esto es la red de seguridad.
        fallbackToCv();
        return;
      }
      setPhase("loading");
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
  }, [wanted]);

  return (
    <div className="stage" aria-hidden="true">
      <div className={phase === "3d" ? "stage-svg stage-svg-off" : "stage-svg"}>
        <MapDiagram />
      </div>
      {wanted && phase !== "svg" && <MapScene onReady={() => setPhase("3d")} />}
    </div>
  );
}
