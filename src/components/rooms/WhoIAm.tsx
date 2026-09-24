import type { Dictionary } from "@/content/dictionary";
import SourceLink from "../SourceLink";

/**
 * System prompt · Quién soy: quién soy, qué busco y cómo trabajo. Todo CV; el
 * nombre del nodo es lo único que viene del marco.
 *
 * Arriba, una sola columna: la presentación y qué busco son dos textos de
 * largo distinto, y la regla del sitio es que ninguna columna deje un hueco
 * al lado de la otra. Debajo, a todo el ancho, los cuatro principios en una
 * rejilla de 2 × 2 (una columna en móvil): la frase en grande y la línea de
 * prueba con su cita al YAML.
 */
export default function WhoIAm({ dict }: { dict: Dictionary }) {
  return (
    <div>
      <p className="max-w-3xl leading-relaxed text-muted text-pretty">{dict.hero.summary}</p>

      <h3 className="label mt-10">{dict.who.lookingFor}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted text-pretty">{dict.hero.availability}</p>

      <h3 className="label mt-12">{dict.work.eyebrow}</h3>
      <ol className="mt-5 grid gap-5 md:grid-cols-2">
        {dict.work.items.map((item) => (
          <li key={item.cite} className="card flex flex-col p-6">
            <p className="text-lg font-semibold tracking-tight text-fg text-balance sm:text-xl">{item.phrase}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{item.proof}</p>
            <SourceLink cite={item.cite} ariaLabel={dict.footer.sourceAria} className="mt-auto pt-4" />
          </li>
        ))}
      </ol>
    </div>
  );
}
