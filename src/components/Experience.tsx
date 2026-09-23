import type { Dictionary } from "@/content/dictionary";
import { formatPeriod, perfil, term } from "@/content/perfil";
import SectionHeading from "./SectionHeading";
import SourceLink from "./SourceLink";

/** La cita de cada puesto: el enlace a su línea del YAML, al pie del bloque. */
const CITE_BY_ROLE = {
  "exp-dalton": "costReduction",
  "exp-loreal": "lorealDashboard",
  "exp-ipn": "publicationMetrics",
} as const;

/**
 * Trayectoria.
 *
 * Cada puesto se titula con su RESULTADO cuando el perfil lo cuantifica, no
 * con el nombre del proyecto: un número se lee en un segundo y un nombre
 * propio obliga a leer el párrafo para saber si importa. Grupo TI México no
 * tiene métrica en el perfil, así que se titula por lo que resolvió.
 *
 * Fechas, empresas, puestos y ubicaciones salen de perfil.json tal cual.
 */
export default function Experience({ dict }: { dict: Dictionary }) {
  return (
    <section id="experience" className="section border-t-0">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.experience.eyebrow} title={dict.experience.title} />

        <ol className="mt-heading">
          {perfil.experiencia.map((rol) => {
            const copy = dict.experience.roles[rol.id];
            const cite = CITE_BY_ROLE[rol.id as keyof typeof CITE_BY_ROLE];

            return (
              <li key={rol.id} className="border-b border-border py-8 first:pt-0 last:border-b-0">
                <div className="role-grid">
                  <div>
                    <p className="font-mono text-xs text-subtle tnum">
                      {formatPeriod(rol.inicio, rol.fin, dict)}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-fg">{rol.empresa}</p>
                    <p className="mt-0.5 text-xs text-subtle">{term(rol.puesto, dict)}</p>
                    <p className="mt-0.5 text-xs text-subtle">{term(rol.ubicacion, dict)}</p>
                  </div>

                  <div>
                    {copy && (
                      <>
                        <h3 className="text-lg font-semibold tracking-tight text-fg text-balance">
                          {copy.headline}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                          {copy.summary}
                        </p>
                        <ul className="mt-4 space-y-2">
                          {copy.highlights.map((h) => (
                            <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                              <span
                                aria-hidden="true"
                                className="dot"
                              />
                              <span className="text-pretty">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {rol.stack.slice(0, 10).map((tech) => (
                        <li
                          key={tech}
                          className="tag"
                        >
                          {term(tech, dict)}
                        </li>
                      ))}
                    </ul>

                    {cite && <SourceLink cite={cite} ariaLabel={dict.footer.sourceAria} className="mt-4" />}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
