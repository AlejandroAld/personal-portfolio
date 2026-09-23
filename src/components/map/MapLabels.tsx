"use client";

import { useEffect, useRef } from "react";
import { registerLabel, useExplorer } from "@/lib/explorer";
import { LABELED, nodeById, pathFor, positionOf, projectMap, type Locale, type NodeId } from "@/lib/map-graph";

export interface LabelCopy {
  readonly agent: string | null;
  readonly name: string;
}

/**
 * Las etiquetas de los nodos: HTML encima del lienzo.
 *
 * Son enlaces de verdad (cada nodo tiene su URL) y el explorador intercepta el
 * clic para volar en vez de recargar. Van en el orden del tour, se recorren
 * con las flechas y Enter entra. Antes de que cargue el 3D se colocan con la
 * misma proyección que el SVG; después, la escena las mueve cada cuadro.
 */
export default function MapLabels({ locale, copy, ariaLabel, node, sub }: { locale: Locale; copy: Readonly<Record<NodeId, LabelCopy>>; ariaLabel: string; node: NodeId | null; sub: string | null }) {
  const ex = useExplorer({ node, sub });
  const root = useRef<HTMLElement>(null);

  // Colocación inicial, con la cámara del mapa y la proporción real.
  useEffect(() => {
    const place = () => {
      const el = root.current;
      if (!el) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      const portrait = aspect < 0.9;
      for (const id of LABELED) {
        const label = el.querySelector<HTMLElement>(`[data-node="${id}"]`);
        if (!label || label.dataset.live) continue;
        const node = nodeById(id);
        const p = projectMap(positionOf(node, portrait), aspect);
        const above = !portrait && node.landscape[1] > 0.5;
        const y = ((1 - p.y) / 2) * h + (above ? -14 - label.offsetHeight : 14);
        label.style.transform = `translate(${(((p.x + 1) / 2) * w).toFixed(1)}px, ${y.toFixed(1)}px) translateX(-50%)`;
        label.dataset.placed = "";
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  return (
    <nav ref={root} className="map-labels" aria-label={ariaLabel} data-level={ex.level}>
      {LABELED.map((id) => (
        <a
          key={id}
          ref={(el) => registerLabel(id, el)}
          href={pathFor(locale, id)}
          data-enter={id}
          data-node={id}
          className="map-label"
          aria-current={ex.node === id ? "location" : undefined}
        >
          {copy[id].agent && <span className="map-label-agent">{copy[id].agent}</span>}
          <span className="map-label-name">{copy[id].name}</span>
        </a>
      ))}
    </nav>
  );
}
