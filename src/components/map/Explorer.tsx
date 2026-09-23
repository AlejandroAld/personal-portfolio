"use client";

import { useEffect } from "react";
import { initExplorer } from "@/lib/explorer";
import type { Locale, NodeId } from "@/lib/map-graph";

/**
 * Arranca el explorador y pone el carril del tour.
 *
 * El carril es un espaciador invisible que le da altura a la página en modo
 * explorar: cada parada del tour es un tramo de scroll, y el almacén lo mide
 * (src/lib/explorer.ts). En modo CV no existe: la columna se desplaza sola.
 */
export default function Explorer({ locale, node, sub }: { locale: Locale; node: NodeId | null; sub: string | null }) {
  useEffect(() => initExplorer(locale, { node, sub }), [locale, node, sub]);
  return <div className="tour" aria-hidden="true" />;
}
