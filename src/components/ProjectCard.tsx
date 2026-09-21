"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Una tarjeta de proyecto.
 *
 * Es cliente sólo por el hover: elevación corta y un borde que se enciende.
 * Con movimiento reducido no se eleva —el borde sí cambia, porque un cambio
 * de color no marea a nadie y sigue diciendo "esto es interactivo"—.
 */
export default function ProjectCard({
  featured = false,
  children,
}: {
  featured?: boolean;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <m.li
      data-reveal=""
      className={`group relative flex flex-col rounded-lg border border-border bg-surface/50 p-6 transition-colors hover:border-accent/45 ${
        featured ? "sm:col-span-2" : ""
      }`}
      variants={
        reduced
          ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
          : {
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            }
      }
      whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
    >
      {children}
    </m.li>
  );
}
