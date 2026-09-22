import type { Dictionary } from "@/content/dictionary";
import Counter from "./Counter";
import SourceLink from "./SourceLink";

/**
 * La tira de métricas.
 *
 * Tres datos del rol actual: qué cambió, qué construyo y hasta dónde llega.
 * Todos salen de perfil.yaml; ninguno se estima, y cuando el perfil no
 * cuantifica algo —el alcance del bot— va sin cifra y sin contador.
 *
 * El contador renderiza el valor final en el servidor —existe sin JS y lo
 * indexa un buscador— y sólo cuenta desde cero al entrar en pantalla. Es lo
 * único que anima desde JavaScript en toda la página.
 */
export default function Metrics({ dict }: { dict: Dictionary }) {
  return (
    <section
      aria-label={dict.metrics.sourceNote}
      className="border-y border-border bg-card px-4 py-12 sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-5xl">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {dict.metrics.items.map((metric) => (
            <li key={metric.cite} className="group relative">
              <p className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
                {metric.countTo === undefined ? (
                  metric.value
                ) : (
                  <Counter to={metric.countTo} prefix={metric.prefix} suffix={metric.suffix} />
                )}
              </p>
              <p className="mt-2 text-sm font-medium text-fg text-pretty">{metric.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle text-pretty">{metric.context}</p>
              <SourceLink cite={metric.cite} ariaLabel={dict.footer.sourceAria} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
