import type { Dictionary } from "@/content/dictionary";
import Counter from "./Counter";
import SourceLink from "./SourceLink";
import { Stagger, StaggerItem } from "./Reveal";

/**
 * La tira de métricas.
 *
 * Tres números del rol actual. Todos salen de perfil.yaml; ninguno se estima,
 * y cuando el perfil no cuantifica algo, no aparece aquí.
 *
 * El par antes → después va literal y no como porcentaje: "48 h → 10 h" dice
 * cuánto trabajo había ahí, y "−79%" se lo traga. El contador baja de 48 a 10,
 * así que la animación ejecuta la reducción en vez de decorarla.
 *
 * El contador se queda con su propia implementación en vez de pasar por
 * motion: renderiza el valor final en el servidor —existe sin JS y lo indexa
 * un buscador— y sólo anima desde cero al entrar en pantalla. Son 600 bytes y
 * ya estaba probado.
 */
export default function Metrics({ dict }: { dict: Dictionary }) {
  return (
    <section
      aria-label={dict.metrics.sourceNote}
      className="border-y border-border bg-surface/40 px-4 py-12 sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-5xl">
        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {dict.metrics.items.map((metric) => (
            <StaggerItem key={metric.cite} className="group relative">
              <p className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
                {metric.before && (
                  <>
                    <span className="text-subtle">{metric.before}</span>
                    {/* La flecha es decorativa; el lector de pantalla oye
                        "48 h a 10 h", no "48 h flecha derecha 10 h". */}
                    <span aria-hidden="true" className="mx-2 text-subtle">
                      →
                    </span>
                    <span className="sr-only"> {dict.metrics.toWord} </span>
                  </>
                )}
                {metric.countTo === undefined ? (
                  metric.value
                ) : (
                  <Counter
                    to={metric.countTo}
                    from={metric.countFrom}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                  />
                )}
              </p>
              <p className="mt-2 text-sm font-medium text-fg text-pretty">{metric.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle text-pretty">{metric.context}</p>
              <SourceLink cite={metric.cite} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
