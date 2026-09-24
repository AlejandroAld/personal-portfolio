import type { Dictionary } from "@/content/dictionary";
import { perfil, terms } from "@/content/perfil";
import ProjectCard from "./ProjectCard";

/**
 * Outputs · Proyectos: los siete proyectos.
 *
 * El agente de CV es UNA tarjeta. Ocupa dos columnas y lleva sus viñetas
 * porque es el que más dice de cómo trabajo, no porque la página sea sobre él.
 *
 * El orden y los stacks salen de perfil.json; agregar un proyecto al YAML lo
 * mete aquí solo, en cuanto tenga su prosa en el diccionario.
 */
export default function Projects({ dict }: { dict: Dictionary }) {
  // El destacado primero; el resto en el orden del perfil.
  const ordered = [...perfil.proyectos].sort((a, b) => {
    const fa = dict.projects.items[a.id]?.featured ? 0 : 1;
    const fb = dict.projects.items[b.id]?.featured ? 0 : 1;
    return fa - fb;
  });

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((proyecto) => {
        const copy = dict.projects.items[proyecto.id];
        if (!copy) return null;
        const stack = terms(proyecto.stack, dict);
        // El enlace sale del YAML (`repo`); el diccionario sólo lo cubre
        // cuando el destino no es un repositorio, como el artículo.
        const href = proyecto.repo || copy.href;

        return (
          <ProjectCard key={proyecto.id} featured={copy.featured}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight text-fg text-balance">{copy.title}</h3>
              {copy.featured && <span className="badge shrink-0">{dict.projects.inProgress}</span>}
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted text-pretty">{copy.summary}</p>

            {copy.bullets && (
              <ul className="mt-4 space-y-2">
                {copy.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-xs leading-relaxed text-subtle">
                    <span aria-hidden="true" className="dot" />
                    <span className="text-pretty">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-5 mb-5 flex flex-wrap gap-1.5">
              {stack.map((tech) => (
                <li key={tech} className="tag">
                  {tech}
                </li>
              ))}
            </ul>

            {/* Al fondo de la tarjeta: en una fila, los pies quedan alineados. */}
            <div className="mt-auto flex items-center gap-4 border-t border-border pt-4">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent transition-colors hover:text-accent-soft">
                  {copy.hrefLabel ?? dict.projects.viewCode} ↗
                </a>
              ) : (
                <span className="font-mono text-xs text-subtle">{dict.projects.privateRepo}</span>
              )}
            </div>
          </ProjectCard>
        );
      })}
    </ul>
  );
}
