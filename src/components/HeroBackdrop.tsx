"use client";

import { useEffect, useRef } from "react";

/**
 * El fondo del héroe.
 *
 * Este componente es minúsculo a propósito: sólo pinta el canvas y decide si
 * vale la pena cargar el shader. El código de WebGL vive en `@/lib/glow` y se
 * importa de forma dinámica, así que:
 *
 *   · no entra al bundle inicial y no compite con el primer pintado;
 *   · si alguna de las condiciones de abajo se cumple, NO SE DESCARGA NADA.
 *     El respaldo no es "cargar y no usar", es no pedir los bytes.
 *
 * Fuera de la ruta crítica: el texto del héroe es el LCP y se pinta sin esperar
 * a nada de esto. La importación arranca en `requestIdleCallback`, después de
 * que el navegador terminó lo que importaba.
 *
 * El degradado CSS del contenedor está SIEMPRE ahí, debajo. El canvas lo tapa
 * cuando funciona; cuando no —sin WebGL, contexto perdido, movimiento reducido
 * o un equipo modesto— el degradado es lo que se ve, y es una composición
 * terminada, no un hueco.
 */
export default function HeroBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Movimiento reducido: no es una animación más corta, es ninguna.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // Sólo se descarta de entrada lo verdaderamente mínimo. Cuatro núcleos
    // descartaba equipos que pintan esto sin despeinarse —y, de paso, la
    // máquina donde se mide—. El corte de verdad no lo pone este número sino
    // la medición de fps de glow.ts, que aborta si el shader no rinde.
    if ((navigator.hardwareConcurrency ?? 8) <= 2) return;

    let stop: (() => void) | null = null;
    let cancelled = false;

    const load = () => {
      if (cancelled) return;
      import("@/lib/glow")
        .then((m) => {
          if (!cancelled) stop = m.start(canvas);
        })
        .catch(() => {
          /* Sin shader se queda el degradado. No hay nada que reportar. */
        });
    };

    // TypeScript lo tipa como siempre presente, pero Safari lo añadió tarde:
    // la comprobación con `in` es la que vale en tiempo de ejecución.
    const idle =
      "requestIdleCallback" in window ? window.requestIdleCallback.bind(window) : undefined;
    const handle = idle ? idle(load, { timeout: 2000 }) : window.setTimeout(load, 500);

    return () => {
      cancelled = true;
      stop?.();
      if (idle) window.cancelIdleCallback?.(handle as number);
      else clearTimeout(handle as number);
    };
  }, []);

  return (
    <div className="hero-backdrop" aria-hidden="true">
      <canvas ref={ref} className="hero-canvas" />
    </div>
  );
}
