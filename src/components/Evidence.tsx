import { CITES, type CiteKey } from "@/lib/evidence";

/**
 * El enlace a la línea exacta.
 *
 * Se lee como una nota al pie porque es lo que es: la afirmación de al lado no
 * vale por estar escrita en grande, vale porque se puede ir a comprobar. Todos
 * los enlaces están fijados a un SHA, así que la línea no se mueve.
 */
export default function Evidence({
  cite,
  label,
  className = "",
}: {
  cite: CiteKey;
  label?: string;
  className?: string;
}) {
  const { href, label: fallback } = CITES[cite];
  const text = label ?? fallback;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`evidence ${className}`}
      aria-label={`Evidence: ${text} — opens in a new tab`}
    >
      <span aria-hidden="true">↗ </span>
      {text}
    </a>
  );
}
