"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Un caso de estudio que se abre en su sitio.
 *
 * Se expande en la misma página en vez de navegar: alguien de reclutamiento da
 * menos de un minuto, y cada navegación es una ocasión de perderlo. La altura
 * se anima con `grid-template-rows: 0fr → 1fr`, que es animación de altura sin
 * medir nada en JS y sin un `max-height` inventado que corte el texto largo.
 *
 * El contenido está siempre en el DOM: sale en la búsqueda del navegador, lo
 * indexa un buscador, y `hidden` nunca miente sobre lo que hay dentro.
 */
export default function CaseStudyCard({
  title,
  kicker,
  labels,
  children,
}: {
  title: string;
  kicker: string;
  labels: { expand: string; collapse: string };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <div className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span>
            <span className="block text-lg font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
              {title}
            </span>
            <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted text-pretty">
              {kicker}
            </span>
          </span>
          <span className="mt-1 flex shrink-0 items-center gap-2 font-mono text-xs text-subtle transition-colors group-hover:text-accent">
            <span className="hidden sm:inline">{open ? labels.collapse : labels.expand}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </h3>

      <div id={bodyId} className="collapsible" data-open={open}>
        <div>
          <div className="pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
