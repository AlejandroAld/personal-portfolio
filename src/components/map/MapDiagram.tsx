import { EDGES, NODES, isPortrait, positionOf, projectMap } from "@/lib/map-graph";

/**
 * El mapa como SVG, renderizado en el servidor.
 *
 * Es lo que se ve mientras el escenario WebGL todavía no cargó: el mismo
 * grafo, proyectado con la misma cámara, para que el 3D lo releve sin salto.
 * Van dos composiciones —apaisada y vertical— y el CSS muestra la que toca.
 * Es decorativo: las etiquetas HTML llevan la interacción.
 */

function Diagram({ aspect, width, height }: { aspect: number; width: number; height: number }) {
  const portrait = isPortrait(aspect);
  const px = (x: number) => ((x + 1) / 2) * width;
  const py = (y: number) => ((1 - y) / 2) * height;
  const at = (id: string) => {
    const n = NODES.find((x) => x.id === id)!;
    return projectMap(positionOf(n, portrait), aspect);
  };
  return (
    <svg
      className={`diagram ${portrait ? "diagram-portrait" : "diagram-landscape"}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="diagram-edges">
        {EDGES.map((e) => {
          const a = at(e.a);
          const b = at(e.b);
          return <line key={`${e.a}-${e.b}`} x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)} data-kind={e.kind} />;
        })}
      </g>
      <g className="diagram-nodes">
        {NODES.map((n) => {
          const p = at(n.id);
          const r = (portrait ? 3 : 4.5) * n.r;
          return <circle key={n.id} cx={px(p.x)} cy={py(p.y)} r={r} data-node={n.id} />;
        })}
      </g>
    </svg>
  );
}

export default function MapDiagram() {
  return (
    <>
      <Diagram aspect={16 / 9} width={1600} height={900} />
      <Diagram aspect={390 / 844} width={390} height={844} />
    </>
  );
}
