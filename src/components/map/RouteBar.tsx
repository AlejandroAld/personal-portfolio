"use client";

import { useExplorer } from "@/lib/explorer";
import { nodeById, pathFor, subByRef, type Locale, type NodeId } from "@/lib/map-graph";

/**
 * La ruta, tipo terminal: ~/alex/memoria/dalton.
 *
 * Fija bajo la barra, en monoespaciada. Cada tramo es un enlace para
 * regresar: `~` y `alex` al mapa, el nodo a su sala. Es el único lugar, con
 * las etiquetas, donde aparece el vocabulario del marco.
 */
export default function RouteBar({ locale, ariaLabel, home, node, sub }: { locale: Locale; ariaLabel: string; home: string; node: NodeId | null; sub: string | null }) {
  const ex = useExplorer({ node, sub });
  const crumbs: { label: string; href: string; enter: string; sub?: string; current: boolean }[] = [
    { label: "~", href: pathFor(locale), enter: "", current: ex.level === "map" },
    { label: home, href: pathFor(locale), enter: "", current: ex.level === "map" },
  ];
  if (ex.node) {
    crumbs.push({ label: nodeById(ex.node).slug[locale], href: pathFor(locale, ex.node), enter: ex.node, current: ex.level === "node" });
    if (ex.sub) crumbs.push({ label: subByRef(ex.node, ex.sub)?.slug[locale] ?? ex.sub, href: pathFor(locale, ex.node, ex.sub), enter: ex.node, sub: ex.sub, current: true });
  }
  return (
    <nav className="route" aria-label={ariaLabel}>
      <ol className="route-list">
        {crumbs.map((c, i) => (
          <li key={`${i}-${c.label}`} className="route-item">
            {i > 0 && i !== 1 && <span className="route-sep" aria-hidden="true">/</span>}
            {i === 1 && <span className="route-sep" aria-hidden="true">/</span>}
            <a href={c.href} data-enter={c.enter} data-sub={c.sub} className="route-link" aria-current={c.current && i === crumbs.length - 1 ? "page" : undefined}>
              {c.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
