import { CITES, type CiteKey } from "@/lib/evidence";

/**
 * Trazabilidad por bloque: el enlace a la línea exacta del YAML que respalda
 * una cifra. Siempre visible, en gris, al final del bloque: en un teléfono no
 * hay hover, y la prueba de que cada número tiene fuente tiene que verse sin
 * tocar nada. El color y el tamaño de objetivo viven en `.source-link`.
 */
export default function SourceLink({
  cite,
  ariaLabel,
  className = "",
}: {
  cite: CiteKey;
  /** Plantilla del diccionario; `{label}` se sustituye por la línea citada. */
  ariaLabel: string;
  className?: string;
}) {
  const { href, label } = CITES[cite];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`source-link ${className}`}
      aria-label={ariaLabel.replace("{label}", label)}
    >
      <span aria-hidden="true">↗ </span>
      {label}
    </a>
  );
}
