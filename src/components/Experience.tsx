import type { Dictionary } from "@/content/dictionary";
import { formatPeriod, perfil, term } from "@/content/perfil";
import { SUBNODES, nodeById, pathFor, type Locale } from "@/lib/map-graph";
import DaltonMoment from "./rooms/DaltonMoment";
import SourceLink from "./SourceLink";

/** La cita de cada puesto: el enlace a su línea del YAML, al pie del bloque. */
const CITE_BY_ROLE = {
  "exp-dalton": "costReduction",
  "exp-loreal": "lorealDashboard",
  "exp-ipn": "publicationMetrics",
} as const;

/**
 * Memory · Experiencia: los cuatro puestos como subnodos, del más reciente
 * al más antiguo.
 *
 * Cada puesto se titula con su RESULTADO cuando el perfil lo cuantifica, no
 * con el nombre del proyecto. En Modo CV se lee entero; en modo explorar la
 * sala muestra la cabecera de cada puesto como entrada a su subnodo, y el
 * subnodo abre el detalle. Dalton lleva su momento: el sistema de más de 180
 * nodos que colapsa en un orquestador.
 *
 * Fechas, empresas, puestos y ubicaciones salen de perfil.json tal cual.
 */
export default function Experience({ dict, locale, activeSub }: { dict: Dictionary; locale: Locale; activeSub: string | null }) {
  const subs = SUBNODES.memory ?? [];
  const slugMemory = nodeById("memory").slug[locale];
  return (
    <ol className="subnodes">
      {subs.map(({ slug: slugs, ref }) => {
        const rol = perfil.experiencia.find((r) => r.id === ref);
        if (!rol) return null;
        const slug = slugs[locale];
        const copy = dict.experience.roles[rol.id];
        const cite = CITE_BY_ROLE[rol.id as keyof typeof CITE_BY_ROLE];
        const href = pathFor(locale, "memory", ref);
        const headingId = `memory-${slug}-title`;

        return (
          <li key={rol.id}>
            {/* `data-sub` lleva el ref del YAML (interno); el id y la URL llevan el slug por función. */}
            <article id={`${slugMemory}-${slug}`} className="subnode" data-sub={ref} data-active-sub={activeSub === ref ? "" : undefined} aria-labelledby={headingId}>
              <div className="role-grid">
                <div className="subnode-meta">
                  <p className="font-mono text-xs text-subtle tnum">{formatPeriod(rol.inicio, rol.fin, dict)}</p>
                  <p className="mt-1.5 text-sm font-medium text-fg">{rol.empresa}</p>
                  <p className="mt-0.5 text-xs text-subtle">{term(rol.puesto, dict)}</p>
                  <p className="mt-0.5 text-xs text-subtle">{term(rol.ubicacion, dict)}</p>
                </div>

                <div>
                  <h3 id={headingId} className="text-lg font-semibold tracking-tight text-fg text-balance">
                    {/* En modo explorar la cabecera es la puerta al subnodo; en Modo CV es sólo el título. */}
                    <a href={href} data-enter="memory" data-sub={ref} className="subnode-link">
                      {copy?.headline ?? term(rol.puesto, dict)}
                      <span className="subnode-arrow" aria-hidden="true">
                        {" "}
                        →
                      </span>
                    </a>
                  </h3>

                  <div className="subnode-body">
                    {copy && <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{copy.summary}</p>}

                    {rol.id === "exp-dalton" && (
                      <DaltonMoment caption={dict.moment.caption} before={dict.moment.before} after={dict.moment.after} metric={dict.moment.metric} />
                    )}

                    {copy && (
                      <ul className="mt-4 space-y-2">
                        {copy.highlights.map((h) => (
                          <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                            <span aria-hidden="true" className="dot" />
                            <span className="text-pretty">{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {rol.stack.slice(0, 10).map((tech) => (
                        <li key={tech} className="tag">
                          {term(tech, dict)}
                        </li>
                      ))}
                    </ul>

                    {cite && <SourceLink cite={cite} ariaLabel={dict.footer.sourceAria} className="mt-4" />}
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
