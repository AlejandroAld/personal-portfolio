"use client";

import { toggleMode, useExplorer } from "@/lib/explorer";

/**
 * Modo CV: todo el contenido en una columna sencilla, sin 3D, imprimible.
 * Siempre visible en la barra. Sin JavaScript no hace falta: la página ya es
 * esa columna, y el CSS esconde el botón.
 */
export default function ModeToggle({ labels }: { labels: { cv: string; explore: string } }) {
  const ex = useExplorer({ node: null, sub: null });
  const cv = ex.mode === "cv";
  return (
    <button type="button" className="mode-toggle" aria-pressed={cv} onClick={() => toggleMode()}>
      {cv ? labels.explore : labels.cv}
    </button>
  );
}
