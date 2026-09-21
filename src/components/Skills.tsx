import type { Dictionary } from "@/content/dictionary";
import { perfil, term, terms } from "@/content/perfil";
import SectionHeading from "./SectionHeading";
import { Stagger, StaggerItem } from "./Reveal";

/**
 * Habilidades por categoría: las nueve de perfil.yaml, tal cual.
 *
 * No se recortan ni se reordenan aquí. Si una categoría sobra o falta, se
 * arregla en el YAML y se vuelve a sincronizar.
 */
export default function Skills({ dict }: { dict: Dictionary }) {
  return (
    <section id="skills" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.skills.eyebrow} title={dict.skills.title} />

        <Stagger className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" step={0.04}>
          {perfil.habilidades.map((grupo) => (
            <StaggerItem key={grupo.categoria}>
              <h3 className="text-sm font-semibold text-fg">{term(grupo.categoria, dict)}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {terms(grupo.items, dict).map((item) => (
                  <li
                    key={item}
                    className="rounded border border-border px-2 py-1 font-mono text-[0.6875rem] text-subtle"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
