"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Entrada progresiva al entrar en pantalla.
 *
 * Un solo IntersectionObserver para toda la página, compartido a nivel de
 * módulo: cuarenta bloques no necesitan cuarenta observers. Cada elemento se
 * deja de observar en cuanto aparece, así que el costo termina con el scroll.
 *
 * Tres salvaguardas, porque el modo de falla de este patrón es dejar contenido
 * permanentemente invisible, y eso es mucho peor que no animar:
 *
 *   1. Si el elemento ya está en pantalla al montar, se revela sin esperar al
 *      observer. Lo de arriba del pliegue no depende de una devolución de
 *      llamada asíncrona.
 *   2. El margen positivo revela un poco ANTES de entrar, así que el bloque ya
 *      está listo cuando llega la vista. Además evita que un scroll rápido lo
 *      salte: el observer calcula intersecciones al entregar, no de continuo.
 *   3. Con prefers-reduced-motion o sin IntersectionObserver, visible de
 *      inmediato. Sin JS, lo hace el <noscript> del layout.
 */

let observer: IntersectionObserver | null = null;

function reveal(el: Element) {
  el.classList.add("is-visible");
}

function sharedObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === "undefined") return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "120px 0px 120px 0px", threshold: 0 },
  );
  return observer;
}

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Escalonado, en ms. Se usa con moderación: es ritmo, no decoración. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      reveal(el);
      return;
    }

    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      reveal(el);
      return;
    }

    const o = sharedObserver();
    if (!o) {
      reveal(el);
      return;
    }

    o.observe(el);
    return () => o.unobserve(el);
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
