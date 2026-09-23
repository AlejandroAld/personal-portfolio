import type { Dictionary } from "@/content/dictionary";
import { contacto, persona } from "@/content/perfil";
import { RESUME_URL } from "@/lib/site";
import SourceLink from "./SourceLink";

/**
 * El núcleo: la primera pantalla.
 *
 * Nombre, rol, las tres cifras con su fuente y el contacto, en HTML encima
 * del núcleo del mapa. Es lo que un reclutador con prisa tiene que poder
 * leer en cinco segundos, sin tocar nada, y es lo mismo en Modo CV, donde
 * abre la columna. Ni una línea sobre agentes: eso vive en el marco y en
 * "Bajo el capó".
 *
 * El LCP es el titular. No hay imagen ni lienzo que lo retrase: el mapa 3D
 * se carga después, en su propio chunk.
 */
export default function Core({ dict }: { dict: Dictionary }) {
  const handle = (url: string) => new URL(url).pathname.replace(/^\/|\/$/g, "");

  return (
    <section id="top" className="core" aria-label={persona.nombre}>
      <div className="core-inner">
        <p className="rise text-sm font-medium text-fg">
          {persona.nombre} <span className="text-subtle">· {dict.hero.eyebrow}</span>
        </p>
        <h1 className="rise-solid rise-2 mt-3 text-display-sm font-semibold tracking-tight text-balance sm:text-display-md lg:text-display">
          {dict.hero.positioning} <span className="text-muted">{dict.hero.positioningAccent}</span>
        </h1>

        <ul className="core-metrics rise rise-3 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6" aria-label={dict.metrics.sourceNote}>
          {dict.metrics.items.map((metric) => (
            <li key={metric.cite}>
              <p className="core-metric text-2xl font-semibold tracking-tight text-fg tnum sm:text-3xl">{metric.value}</p>
              <p className="mt-1 text-xs leading-snug text-muted text-pretty">{metric.label}</p>
              <SourceLink cite={metric.cite} ariaLabel={dict.footer.sourceAria} className="mt-1" />
            </li>
          ))}
        </ul>

        <ul className="rise rise-4 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li>
            <a href={`mailto:${contacto.email}`} className="core-link">
              {contacto.email}
            </a>
          </li>
          <li>
            <a href={contacto.linkedin} target="_blank" rel="noopener noreferrer" className="core-link">
              {handle(contacto.linkedin)}
            </a>
          </li>
          <li>
            <a href={contacto.github} target="_blank" rel="noopener noreferrer" className="core-link">
              @{handle(contacto.github)}
            </a>
          </li>
        </ul>

        {/* En modo explorar: la pista. En Modo CV: los botones de siempre. */}
        <p className="rise rise-4 core-hint" aria-hidden="true">
          {dict.map.hint}
        </p>
        <div className="rise rise-4 core-actions">
          <a href={`mailto:${contacto.email}`} className="btn btn-primary">
            {dict.hero.ctaContact}
            <span aria-hidden="true">→</span>
          </a>
          {RESUME_URL && (
            <a href={RESUME_URL} download className="btn btn-ghost">
              {dict.hero.ctaResume}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
