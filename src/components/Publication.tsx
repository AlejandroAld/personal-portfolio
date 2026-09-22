import type { Dictionary } from "@/content/dictionary";
import { publicacion, term } from "@/content/perfil";
import SectionHeading from "./SectionHeading";

/**
 * La publicación arbitrada, con sección propia.
 *
 * Es la credencial menos común del perfil y estaba enterrada dentro de un caso
 * de estudio. Aquí va con sus números, el enlace a la revista, y la sección de
 * limitaciones — que es lo que separa citar un paper de entenderlo.
 */
export default function Publication({ dict }: { dict: Dictionary }) {
  return (
    <section id="publication" className="section">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.publication.eyebrow} title={dict.publication.title} />

        <div className="mt-heading grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium text-muted">{term(publicacion.medio, dict)}</p>
            <p className="mt-4 leading-relaxed text-muted text-pretty">{dict.publication.body}</p>
            <p className="mt-4 rounded-sm border-l-2 border-border-strong bg-card px-4 py-3 text-sm leading-relaxed text-subtle text-pretty">
              {dict.publication.limitations}
            </p>
            <p className="mt-6">
              <a
                href={publicacion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {dict.publication.readPaper}
                <span aria-hidden="true">↗</span>
              </a>
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-6 self-start lg:col-span-2 lg:grid-cols-1 lg:gap-8">
            {dict.publication.results.map((r) => (
              <li key={r.label}>
                <p className="text-2xl font-semibold tracking-tight text-fg tnum sm:text-3xl">{r.value}</p>
                <p className="mt-1 text-xs text-subtle text-pretty">{r.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
