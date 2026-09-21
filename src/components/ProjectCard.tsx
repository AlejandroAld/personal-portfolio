import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * Una tarjeta de proyecto: entra con su índice en la rejilla y se eleva dos
 * píxeles al pasar el cursor, con el borde encendiéndose a la misma velocidad.
 * Con movimiento reducido no se eleva —el borde sí cambia, porque un cambio de
 * color no marea a nadie y sigue diciendo "esto es interactivo"—.
 */
export default function ProjectCard({
  index,
  featured = false,
  children,
}: {
  index: number;
  featured?: boolean;
  children: ReactNode;
}) {
  return (
    <Reveal
      as="li"
      index={index}
      hover
      className={`card group relative flex flex-col p-6 transition-colors hover:border-accent-line ${
        featured ? "sm:col-span-2 lg:col-span-3" : ""
      }`}
    >
      {children}
    </Reveal>
  );
}
