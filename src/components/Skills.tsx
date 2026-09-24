import type { Dictionary } from "@/content/dictionary";
import { perfil, term, terms } from "@/content/perfil";

/**
 * Tools · Stack: las habilidades en racimos, las nueve categorías de
 * perfil.yaml tal cual.
 *
 * No se recortan ni se reordenan aquí. Si una categoría sobra o falta, se
 * arregla en el YAML y se vuelve a sincronizar.
 *
 * Una sola columna: las categorías tienen de cuatro a catorce elementos, y
 * en rejilla las cortas dejaban hueco al lado de las largas.
 */
export default function Skills({ dict }: { dict: Dictionary }) {
  return (
    <ul className="space-y-7">
      {perfil.habilidades.map((grupo) => (
        <li key={grupo.categoria} className="cluster">
          <h3 className="text-sm font-semibold text-fg">{term(grupo.categoria, dict)}</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {terms(grupo.items, dict).map((item) => (
              <li key={item} className="tag">
                {item}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
