"use client";

import * as m from "motion/react-m";
import { useReducedMotion, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { DISTANCE, DURATION, EASE_OUT, STAGGER, STAGGER_MAX } from "@/lib/motion";

/**
 * Entrada al hacer scroll.
 *
 * Cada bloque se observa a sí mismo: entra al cruzar el 20 % inferior del
 * viewport, una sola vez, y no vuelve a animarse al subir. Los hijos de una
 * lista se escalonan por `index`, y a partir del cuarto ya no esperan más: un
 * escalonado largo retrasa la lectura, que es lo contrario de lo que quiere.
 *
 * No se usa `animation-timeline: view()`: una línea de tiempo de scroll va
 * atada a la posición, así que la entrada se deshace al subir, y eso está
 * prohibido a propósito. Un IntersectionObserver de una sola vez es lo que
 * pide el comportamiento, y es lo que `whileInView` con `once` hace.
 *
 * Con movimiento reducido las variantes se sustituyen por unas que no mueven
 * ni funden nada. El elemento aparece en su estado final y ya.
 */

const VIEWPORT = { once: true, margin: "0px 0px -20% 0px" } as const;

const ENTER: Variants = {
  hidden: { opacity: 0, y: DISTANCE.sm },
  show: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASE_OUT,
      delay: Math.min(index, STAGGER_MAX - 1) * STAGGER,
    },
  }),
};

const STILL: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export function Reveal({
  children,
  index = 0,
  as = "div",
  className,
  id,
  hover = false,
}: {
  children: ReactNode;
  /** Posición en su lista, para el escalonado. Fuera de una lista, 0. */
  index?: number;
  as?: "div" | "li";
  className?: string;
  id?: string;
  /** Tarjetas: elevación corta al pasar el cursor. */
  hover?: boolean;
}) {
  const reduced = useReducedMotion();
  const Tag = m[as] as ElementType;

  return (
    <Tag
      id={id}
      data-reveal=""
      className={className}
      custom={index}
      variants={reduced ? STILL : ENTER}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      whileHover={
        hover && !reduced ? { y: -2, transition: { duration: DURATION.fast, ease: EASE_OUT } } : undefined
      }
    >
      {children}
    </Tag>
  );
}

export default Reveal;
