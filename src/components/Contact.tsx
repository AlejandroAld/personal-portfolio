import type { Dictionary } from "@/content/dictionary";
import { contacto, persona } from "@/content/perfil";
import { RESUME_URL } from "@/lib/site";
import SectionHeading from "./SectionHeading";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

/**
 * Contacto.
 *
 * Correo, ciudad, LinkedIn, GitHub y la descarga del CV. Sin teléfono y sin
 * dirección: el perfil los declara como datos no divulgables, y el sitio
 * respeta la misma regla que el agente.
 */
export default function Contact({ dict }: { dict: Dictionary }) {
  const entries = [
    { label: dict.contact.email, value: contacto.email, href: `mailto:${contacto.email}`, external: false },
    { label: dict.contact.location, value: persona.ubicacion, href: null, external: false },
    { label: dict.contact.linkedin, value: "in/jose-alejandro-aldama-ramos", href: contacto.linkedin, external: true },
    { label: dict.contact.github, value: "@AlejandroAld", href: contacto.github, external: true },
  ];

  return (
    <section id="contact" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={dict.contact.eyebrow}
          title={dict.contact.title}
          intro={dict.contact.body}
        />

        <Stagger className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((entry) => {
            const inner = (
              <>
                <span className="block font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                  {entry.label}
                </span>
                <span className="mt-1.5 block truncate text-sm text-fg transition-colors group-hover:text-accent">
                  {entry.value}
                </span>
              </>
            );

            return (
              <StaggerItem key={entry.label} className="bg-bg">
                {entry.href ? (
                  <a
                    href={entry.href}
                    target={entry.external ? "_blank" : undefined}
                    rel={entry.external ? "noopener noreferrer" : undefined}
                    className="group block px-5 py-5 transition-colors hover:bg-surface"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="px-5 py-5">{inner}</div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${contacto.email}`}
              className="inline-flex items-center gap-2 rounded bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover"
            >
              {dict.contact.title}
              <span aria-hidden="true">→</span>
            </a>
            {/* Apagado hasta que exista el PDF. */}
            {RESUME_URL && (
              <a
                href={RESUME_URL}
                download
                className="inline-flex items-center gap-2 rounded border border-border-strong px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
              >
                {dict.contact.resume}
              </a>
            )}
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-subtle text-pretty">
            {dict.contact.languages}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
