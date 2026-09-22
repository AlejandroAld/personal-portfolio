import type { ReactNode } from "react";

/**
 * Una tarjeta de proyecto. Renderiza visible, sin estado inicial que dependa
 * de JS; al pasar el cursor el borde pasa del gris fino al acento, en CSS y
 * a la velocidad de una entrada. Nada se mueve.
 */
export default function ProjectCard({
  featured = false,
  children,
}: {
  featured?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={`card card-hover group relative flex flex-col p-6 ${featured ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      {children}
    </li>
  );
}
