import type { Dictionary } from "@/content/dictionary";
import {
  educacion,
  educacionPeriodo,
  formatPeriod,
  perfil,
  publicacion,
  term,
  terms,
} from "@/content/perfil";
import Evidence from "./Evidence";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Trayectoria.
 *
 * Puestos, fechas, empresas, estudios, publicación y certificaciones salen de
 * perfil.json tal cual. Aquí no se escribe ninguna fecha a mano: corregirla en
 * el YAML y volver a sincronizar la corrige en los dos idiomas a la vez.
 */
export default function Track({ dict }: { dict: Dictionary }) {
  const { years, gpa } = educacionPeriodo();

  return (
    <section id="track" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.track.eyebrow} title={dict.track.title} />

        {/* --- Puestos --- */}
        <ol className="mt-10">
          {perfil.experiencia.map((rol) => {
            const prose = dict.track.roles[rol.id];
            return (
              <li key={rol.id} className="border-b border-border py-7 first:pt-0 last:border-b-0">
                <Reveal>
                  <div className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
                    <div>
                      <p className="font-mono text-xs text-subtle tnum">
                        {formatPeriod(rol.inicio, rol.fin, dict)}
                      </p>
                      <p className="mt-1 font-mono text-[0.6875rem] text-subtle">
                        {term(rol.ubicacion, dict)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-fg">
                        {term(rol.puesto, dict)}
                        <span className="text-muted"> · {rol.empresa}</span>
                      </h3>

                      {prose && (
                        <>
                          <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                            {prose.summary}
                          </p>
                          <ul className="mt-4 space-y-2">
                            {prose.highlights.map((h) => (
                              <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                                <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" />
                                <span className="text-pretty">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>

        {/* --- Estudios, publicación y certificaciones --- */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          <Reveal>
            <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
              {dict.track.education}
            </h3>
            <p className="mt-4 text-base font-semibold text-fg">{term(educacion.titulo, dict)}</p>
            <p className="mt-1 text-sm text-muted">{educacion.institucion}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-subtle">
              <span className="tnum">{years}</span>
              {gpa && (
                <span className="rounded bg-accent/10 px-2 py-0.5 text-accent tnum">
                  {dict.track.gpa} {gpa}
                </span>
              )}
            </p>
            <p className="mt-3">
              <Evidence cite="education" />
            </p>
          </Reveal>

          <Reveal delay={60}>
            <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
              {dict.track.publication}
            </h3>
            <p className="mt-4 text-base font-semibold text-fg text-pretty">{publicacion.titulo}</p>
            <p className="mt-1 text-sm text-muted">{term(publicacion.medio, dict)}</p>
            <p className="mt-3 flex flex-wrap items-center gap-4">
              <a
                href={publicacion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-accent transition-colors hover:text-accent-soft"
              >
                {dict.track.readPaper} ↗
              </a>
              <Evidence cite="publicationMetrics" />
            </p>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-12">
            <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
              {dict.track.certifications}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {perfil.certificaciones.map((cert) => (
                <li
                  key={cert.nombre}
                  className="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-xs text-muted"
                >
                  {cert.nombre}
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[0.625rem] text-amber-200/90">
                    {dict.track.inProgress}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              <Evidence cite="certifications" />
            </p>
          </div>
        </Reveal>

        {/* --- Stack --- */}
        <div id="stack" className="mt-16 scroll-mt-20 border-t border-border pt-12">
          <h3 className="font-mono text-xs tracking-wide text-accent uppercase">
            {dict.track.stackTitle}
          </h3>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {perfil.habilidades.map((grupo, i) => (
              <Reveal key={grupo.categoria} delay={i * 40}>
                <h4 className="text-sm font-semibold text-fg">{term(grupo.categoria, dict)}</h4>
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
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
