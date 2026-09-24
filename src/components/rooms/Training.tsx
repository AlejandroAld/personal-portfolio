import type { Dictionary } from "@/content/dictionary";
import { educacion, educacionPeriodo, perfil, persona, publicacion, term } from "@/content/perfil";
import SourceLink from "../SourceLink";

/**
 * Training · Formación: el IPN, la investigación y la publicación arbitrada,
 * los idiomas y las certificaciones en curso.
 *
 * La publicación es la credencial menos común del perfil y va con sus
 * números, el enlace a la revista y la sección de limitaciones, que es lo que
 * separa citar un paper de entenderlo.
 *
 * Una sola columna: la publicación es mucho más larga que idiomas y
 * certificaciones juntos, y la regla del sitio es que ninguna columna deje un
 * hueco al lado de la otra. Las certificaciones van en una fila de tarjetas
 * de la misma altura.
 */
export default function Training({ dict }: { dict: Dictionary }) {
  const { years, gpa } = educacionPeriodo();
  return (
    <div>
      <div className="max-w-3xl">
        <h3 className="label">{dict.context.education}</h3>
        <p className="mt-4 text-base font-semibold text-fg">{term(educacion.titulo, dict)}</p>
        <p className="mt-1 text-sm text-muted">{educacion.institucion}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-subtle">
          <span className="tnum">{years}</span>
          {gpa && (
            <span className="badge tnum">
              {dict.certifications.gpa} {gpa}
            </span>
          )}
        </p>

        <h3 className="label mt-10">{dict.publication.eyebrow}</h3>
        <p className="mt-4 text-base font-semibold tracking-tight text-fg text-balance">{dict.publication.title}</p>
        <p className="mt-1 text-sm font-medium text-muted">{term(publicacion.medio, dict)}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">{dict.publication.body}</p>
        <p className="mt-4 rounded-sm border-l-2 border-border-strong bg-card px-4 py-3 text-sm leading-relaxed text-subtle text-pretty">{dict.publication.limitations}</p>
        <ul className="mt-5 grid grid-cols-3 gap-6">
          {dict.publication.results.map((r) => (
            <li key={r.label}>
              <p className="text-2xl font-semibold tracking-tight text-fg tnum">{r.value}</p>
              <p className="mt-1 text-xs text-subtle text-pretty">{r.label}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap items-center gap-4">
          <a href={publicacion.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            {dict.publication.readPaper}
            <span aria-hidden="true">↗</span>
          </a>
          <SourceLink cite="publicationMetrics" ariaLabel={dict.footer.sourceAria} />
        </p>
      </div>

      <div>
        <h3 className="label mt-10">{dict.context.languages}</h3>
        <ul className="mt-4 space-y-2">
          {persona.idiomas.map((i) => (
            <li key={i.idioma} className="text-sm leading-relaxed text-muted">
              <span className="font-medium text-fg">{term(i.idioma, dict)}</span> · {term(i.nivel, dict)}
            </li>
          ))}
        </ul>

        <h3 className="label mt-10">{dict.context.certifications}</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {perfil.certificaciones.map((cert) => (
            <li key={cert.nombre} className="flex flex-col justify-between gap-3 rounded-sm border border-border px-3 py-2.5">
              <span className="text-sm text-muted text-pretty">{cert.nombre}</span>
              <span className="badge self-start">{dict.certifications.inProgress}</span>
            </li>
          ))}
        </ul>
        <SourceLink cite="certifications" ariaLabel={dict.footer.sourceAria} className="mt-3" />
      </div>
    </div>
  );
}
