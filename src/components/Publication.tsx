import type { Dictionary } from "@/content/dictionary";
import { publicacion, term } from "@/content/perfil";
import SectionHeading from "./SectionHeading";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

/**
 * La publicación arbitrada, con sección propia.
 *
 * Es la credencial menos común del perfil y estaba enterrada dentro de un caso
 * de estudio. Aquí va con sus números, el enlace a la revista, y la sección de
 * limitaciones — que es lo que separa citar un paper de entenderlo.
 */
export default function Publication({ dict }: { dict: Dictionary }) {
  return (
    <section id="publication" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.publication.eyebrow} title={dict.publication.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <Reveal>
            <p className="text-sm font-medium text-accent">{term(publicacion.medio, dict)}</p>
            <p className="mt-4 leading-relaxed text-muted text-pretty">{dict.publication.body}</p>
            <p className="mt-4 rounded border-l-2 border-border-strong bg-surface/50 py-3 pr-4 pl-4 text-sm leading-relaxed text-subtle text-pretty">
              {dict.publication.limitations}
            </p>
            <p className="mt-6">
              <a
                href={publicacion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded border border-border-strong px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
              >
                {dict.publication.readPaper}
                <span aria-hidden="true">↗</span>
              </a>
            </p>
          </Reveal>

          <Stagger className="grid grid-cols-3 gap-6 self-start lg:grid-cols-1 lg:gap-8">
            {dict.publication.results.map((r) => (
              <StaggerItem key={r.label}>
                <p className="text-2xl font-semibold tracking-tight text-fg tnum sm:text-3xl">{r.value}</p>
                <p className="mt-1 text-xs text-subtle text-pretty">{r.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
