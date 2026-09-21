import type { Dictionary } from "@/content/dictionary";
import { educacion, educacionPeriodo, perfil, term } from "@/content/perfil";
import SectionHeading from "./SectionHeading";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

/** Estudios y certificaciones. Las tres van "En curso": decirlo es lo honesto. */
export default function Credentials({ dict }: { dict: Dictionary }) {
  const { years, gpa } = educacionPeriodo();

  return (
    <section id="credentials" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.certifications.eyebrow} title={dict.certifications.title} />

        <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-14">
          <Reveal>
            <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
              {dict.certifications.education}
            </h3>
            <p className="mt-4 text-base font-semibold text-fg">{term(educacion.titulo, dict)}</p>
            <p className="mt-1 text-sm text-muted">{educacion.institucion}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-subtle">
              <span className="tnum">{years}</span>
              {gpa && (
                <span className="rounded bg-accent/10 px-2 py-0.5 text-accent tnum">
                  {dict.certifications.gpa} {gpa}
                </span>
              )}
            </p>
          </Reveal>

          <div>
            <h3 className="font-mono text-xs tracking-wide text-subtle uppercase">
              {dict.certifications.title}
            </h3>
            <Stagger className="mt-4 space-y-2">
              {perfil.certificaciones.map((cert) => (
                <StaggerItem
                  key={cert.nombre}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2.5"
                >
                  <span className="text-sm text-muted text-pretty">{cert.nombre}</span>
                  <span className="shrink-0 rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[0.625rem] text-amber-200/90">
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
