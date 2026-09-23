import { EDGES, NODES, PATH } from "@/lib/agent-graph";

/**
 * El grafo del agente como SVG, renderizado en el servidor.
 *
 * Es lo que se ve sin WebGL, con movimiento reducido, y mientras el escenario
 * 3D todavía no cargó: el mismo grafo, el mismo camino, sin vuelos de cámara.
 * El paso activo se resalta con `html[data-run-step]`, que pone el marcador;
 * sin JavaScript se queda en el paso 1, que es lo que describe el HTML.
 *
 * Es decorativo: el contenido lo explica todo por sí solo, y por eso va con
 * aria-hidden.
 */

const W = 400;
const H = 800;
const sx = (x: number) => 200 + x * 150;
const sy = (y: number) => 400 - y * 340;

export default function AgentDiagram() {
  return (
    <svg className="diagram" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <g className="diagram-edges">
        {EDGES.map(([a, b]) => {
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          const steps = PATH.map((id, i) => (id === b || (i > 0 && PATH[i - 1] === a && id === b) ? i + 1 : 0)).filter(Boolean);
          return (
            <line
              key={`${a}-${b}`}
              x1={sx(na.p[0])}
              y1={sy(na.p[1])}
              x2={sx(nb.p[0])}
              y2={sy(nb.p[1])}
              data-steps={steps.join(" ") || undefined}
            />
          );
        })}
      </g>
      <g className="diagram-nodes">
        {NODES.map((n) => (
          <circle key={n.id} cx={sx(n.p[0])} cy={sy(n.p[1])} r={5 * n.r} data-node={n.id} data-steps={PATH.map((id, i) => (id === n.id ? i + 1 : 0)).filter(Boolean).join(" ") || undefined} />
        ))}
      </g>
    </svg>
  );
}
