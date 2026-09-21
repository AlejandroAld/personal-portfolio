import { CITES, type CiteKey } from "@/lib/evidence";

/**
 * Trazabilidad por bloque, en reposo invisible.
 *
 * La página ya no lleva una cita bajo cada párrafo: eso era ruido, y el pie
 * explica de una vez que todo sale de un YAML. Lo que queda es esto, para
 * quien quiera comprobar un número concreto.
 *
 * Va en `absolute` para no ocupar espacio, y aparece al pasar el cursor por el
 * bloque o al enfocarlo con el teclado. Sigue siendo alcanzable con tabulador,
 * que es lo que lo separa de esconderlo de verdad.
 */
export default function SourceLink({ cite, className = "" }: { cite: CiteKey; className?: string }) {
  const { href, label } = CITES[cite];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`source-link ${className}`}
      aria-label={`Source: ${label} — opens in a new tab`}
    >
      <span aria-hidden="true">↗ </span>
      {label}
    </a>
  );
}
