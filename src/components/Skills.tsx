import type { Dictionary } from "@/content/dictionary";
import { perfil, term, terms } from "@/content/perfil";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * Habilidades por categoría: las nueve de perfil.yaml, tal cual.
 *
 * No se recortan ni se reordenan aquí. Si una categoría sobra o falta, se
 * arregla en el YAML y se vuelve a sincronizar.
 */
export default function Skills({ dict }: { dict: Dictionary }) {
  return (
    <section id="skills" className="section">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.skills.eyebrow} title={dict.skills.title} />

        <ul className="mt-heading grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {perfil.habilidades.map((grupo, i) => (
            <Reveal as="li" key={grupo.categoria} index={i}>
              <h3 className="text-sm font-semibold text-fg">{term(grupo.categoria, dict)}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {terms(grupo.items, dict).map((item) => (
                  <li
                    key={item}
                    className="tag"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
