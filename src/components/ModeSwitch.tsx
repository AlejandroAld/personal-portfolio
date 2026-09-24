"use client";

import { switchMode, useExplorer, type Choice } from "@/lib/explorer";

/**
 * El interruptor de modo, "CV | Explorar": segmentado, con el modo activo en
 * acento. Siempre visible en los dos modos; en móvil, además, fijo abajo
 * (`fixed` lo pone el CSS de la copia del pie). Cambiar de modo usa la misma
 * caída del umbral, en corto. Sin JavaScript no hace falta: la página ya es
 * la columna, y el CSS lo esconde.
 */
export default function ModeSwitch({ labels, ariaLabel, placement }: { labels: { cv: string; explore: string }; ariaLabel: string; placement: "nav" | "bottom" }) {
  const ex = useExplorer({ node: null, sub: null });
  const active: Choice = ex.mode === "cv" ? "cv" : "explore";
  const option = (mode: Choice, label: string) => (
    <button type="button" data-mode={mode} aria-pressed={active === mode} className="mode-switch-option" onClick={() => switchMode(mode)}>
      {label}
    </button>
  );
  const group = (
    <div className={`mode-switch mode-switch-${placement}`} role="group" aria-label={ariaLabel}>
      {option("cv", labels.cv)}
      {option("explore", labels.explore)}
    </div>
  );
  // La copia fija de abajo va fuera de la barra: un landmark propio para que
  // ningún contenido quede fuera de uno.
  return placement === "bottom" ? <nav aria-label={ariaLabel}>{group}</nav> : group;
}
