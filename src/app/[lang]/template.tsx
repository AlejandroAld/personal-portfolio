"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

/**
 * Transición entre idiomas.
 *
 * `template.tsx` se vuelve a montar en cada navegación, a diferencia de
 * `layout.tsx`, y la única navegación real del sitio es el cambio de idioma.
 *
 * La primera carga NO se anima, y esa es la parte importante. `motion`
 * serializa el estado inicial como estilo en línea, así que envolver la página
 * entera en `initial={{ opacity: 0 }}` metería `opacity:0` en el HTML del
 * servidor: el LCP se retrasaría hasta que hidratara React, y sin JS la página
 * no se vería nunca. La bandera de módulo sobrevive a los remontajes del
 * template pero no al primer render, así que el primer pintado sale limpio y
 * sólo animan las navegaciones posteriores.
 *
 * Sólo opacidad, sin desplazamiento: una página completa moviéndose es justo
 * lo que molesta a quien pide movimiento reducido. Con esa preferencia, nada.
 */

let navigated = false;

export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const isFirstPaint = !navigated;

  useEffect(() => {
    navigated = true;
  }, []);

  if (isFirstPaint || reduced) return <>{children}</>;

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22, ease: "easeOut" }}>
      {children}
    </m.div>
  );
}
