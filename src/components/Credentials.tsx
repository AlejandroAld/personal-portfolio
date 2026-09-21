import type { Dictionary } from "@/content/dictionary";
import { educacion, educacionPeriodo, perfil, term } from "@/content/perfil";
import SectionHeading from "./SectionHeading";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

/** Estudios y certificaciones. Las tres van "En curso": decirlo es lo honesto. */
export default function Credentials({ dict }: { dict: Dictionary }) {
  const { years, gpa } = educacionPeriodo();

  return (
    <section id="credentials" className="section">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.certifications.eyebrow} title={dict.certifications.title} />

        <div className="mt-heading grid gap-10 sm:grid-cols-2 sm:gap-14">
          <Reveal>
            <h3 className="label">
              {dict.certifications.education}
            </h3>
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
          </Reveal>

          <div>
            <h3 className="label">
              {dict.certifications.list}
            </h3>
            <Stagger className="mt-4 space-y-2">
              {perfil.certificaciones.map((cert) => (
                <StaggerItem
                  key={cert.nombre}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border px-3 py-2.5"
                >
                  <span className="text-sm text-muted text-pretty">{cert.nombre}</span>
                  <span className="badge shrink-0">
                    {dict.certifications.inProgress}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
