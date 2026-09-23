"use client";

import { useEffect, useRef } from "react";

/**
 * El momento fuerte de Dalton: un grafo caótico de más de 180 nodos que
 * colapsa en un solo orquestador con cuatro agentes, y el 92 %.
 *
 * Es un SVG en línea, no WebGL: vive dentro del contenido, funciona en Modo
 * CV y sin JavaScript (se ve el estado final), y no abre un segundo contexto.
 * Con JavaScript, el caos se dibuja primero y colapsa cuando el bloque entra
 * en pantalla; cada nodo lleva sus dos posiciones y el CSS interpola. Con
 * movimiento reducido se queda el estado final.
 *
 * Los 184 nodos y las aristas del caos salen de un generador con semilla
 * fija: el dibujo es el mismo en el servidor y en el cliente.
 */

const W = 640;
const H = 360;
const N = 184;
const BRANCHES = 4;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export interface MomentNode {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly hub: boolean;
}

export function momentNodes(): { nodes: MomentNode[]; chaos: [number, number][] } {
  const rnd = seeded(2025);
  const nodes: MomentNode[] = [];
  const cx = W / 2;
  const cy = H / 2;
  for (let i = 0; i < N; i++) {
    // Caos: repartidos por todo el lienzo, sin estructura.
    const x0 = 24 + rnd() * (W - 48);
    const y0 = 24 + rnd() * (H - 48);
    // Orden: el orquestador al centro y cuatro ramas, los demás se pliegan a su rama.
    const hub = i === 0;
    const branch = i % BRANCHES;
    const angle = -Math.PI / 2 + (branch / BRANCHES) * Math.PI * 2;
    const depth = hub ? 0 : 1 + Math.floor((i - 1) / BRANCHES) / (N / BRANCHES);
    const spread = (rnd() - 0.5) * 0.5;
    const radius = hub ? 0 : 58 + depth * 96;
    const x1 = cx + Math.cos(angle + spread) * radius * 1.35;
    const y1 = cy + Math.sin(angle + spread) * radius * 0.8;
    nodes.push({ x0, y0, x1, y1, hub });
  }
  const chaos: [number, number][] = [];
  for (let i = 0; i < 260; i++) chaos.push([Math.floor(rnd() * N), Math.floor(rnd() * N)]);
  return { nodes, chaos };
}

export default function DaltonMoment({ caption, before, after, metric }: { caption: string; before: string; after: string; metric: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.dataset.state = "after";
      return;
    }
    el.dataset.state = "before";
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        timer = window.setTimeout(() => {
          el.dataset.state = "after";
        }, 900);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const { nodes, chaos } = momentNodes();
  const branches = nodes.filter((_, i) => i > 0 && i <= BRANCHES);

  return (
    <div ref={root} className="moment" data-state="after">
      <svg className="moment-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption}>
        <g className="moment-chaos-edges">
          {chaos.map(([a, b], i) => (
            <line key={i} x1={nodes[a].x0} y1={nodes[a].y0} x2={nodes[b].x0} y2={nodes[b].y0} />
          ))}
        </g>
        <g className="moment-order-edges">
          {branches.map((b, i) => (
            <line key={i} x1={nodes[0].x1} y1={nodes[0].y1} x2={b.x1} y2={b.y1} />
          ))}
        </g>
        <g className="moment-nodes">
          {nodes.map((n, i) => (
            <circle
              key={i}
              r={n.hub ? 9 : i <= BRANCHES ? 5 : 2.2}
              className={n.hub ? "moment-hub" : i <= BRANCHES ? "moment-branch" : undefined}
              style={{ ["--x0" as string]: `${n.x0.toFixed(1)}px`, ["--y0" as string]: `${n.y0.toFixed(1)}px`, ["--x1" as string]: `${n.x1.toFixed(1)}px`, ["--y1" as string]: `${n.y1.toFixed(1)}px`, ["--i" as string]: i }}
            />
          ))}
        </g>
      </svg>
      <div className="moment-legend" aria-hidden="true">
        <span className="moment-before">{before}</span>
        <span className="moment-after">{after}</span>
        <span className="moment-metric tnum">{metric}</span>
      </div>
      <p className="moment-caption">{caption}</p>
    </div>
  );
}
