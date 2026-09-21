"use client";

import * as m from "motion/react-m";
import { useReducedMotion, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";

/**
 * Entrada al hacer scroll, y el escalonado de las listas de tarjetas.
 *
 * `whileInView` con `once: true` anima una sola vez y se olvida: no hay estado
 * que mantener ni observador que siga corriendo después.
 *
 * Con movimiento reducido las variantes se sustituyen por unas que no mueven
 * ni funden nada. El elemento aparece en su estado final y ya.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const ENTER: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const STILL: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

const VIEWPORT = { once: true, margin: "0px 0px -60px 0px" } as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Escalonado manual, en ms. Para listas prefiere `Stagger`. */
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <m.div
      data-reveal=""
      className={className}
      variants={reduced ? STILL : ENTER}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={reduced ? undefined : { delay: delay / 1000 }}
    >
      {children}
    </m.div>
  );
}

/**
 * Contenedor de una lista escalonada. Los hijos deben ser `StaggerItem`: el
 * retraso lo reparte el padre, así que agregar o quitar tarjetas no obliga a
 * recalcular ningún número a mano.
 */
export function Stagger({
  children,
  className,
  as = "ul",
  step = 0.06,
}: {
  children: ReactNode;
  className?: string;
  as?: "ul" | "ol" | "div";
  step?: number;
}) {
  const reduced = useReducedMotion();
  const Tag = m[as] as ElementType;

  return (
    <Tag
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduced ? 0 : step } },
      }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "li",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "li" | "div";
  id?: string;
}) {
  const reduced = useReducedMotion();
  const Tag = m[as] as ElementType;

  return (
    <Tag id={id} data-reveal="" className={className} variants={reduced ? STILL : ENTER}>
      {children}
    </Tag>
  );
}

export default Reveal;
