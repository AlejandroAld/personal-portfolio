"use client";

import { cubicBezier } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { COUNT_DURATION, EASE_OUT } from "@/lib/motion";

/**
 * Contador de métrica.
 *
 * El valor final se renderiza en el HTML del servidor: existe sin JS, lo lee un
 * buscador, y el ancho no salta porque la cifra usa `tabular-nums`. El JS sólo
 * cuenta desde cero cuando el 30 % de la cifra entra en pantalla, una vez.
 *
 * Con prefers-reduced-motion no se anima nada: la cifra se queda en su valor,
 * que es lo que la métrica quiere comunicar de todas formas.
 */

const ease = cubicBezier(...EASE_OUT);

export default function Counter({
  to,
  from = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  /** Arranca aquí. Con `from > to` el contador baja, que es el punto. */
  from?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [shown, setShown] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || done.current) return;
        done.current = true;
        observer.disconnect();

        const start = performance.now();
        const duration = COUNT_DURATION * 1000;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(from + ease(t) * (to - from)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [to, from]);

  return (
    <span ref={ref} className="tnum">
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
