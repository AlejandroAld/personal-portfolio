import type { Dictionary } from "@/content/dictionary";
import { contacto, persona } from "@/content/perfil";
import { RESUME_URL } from "@/lib/site";
import SectionHeading from "./SectionHeading";

/**
 * Contacto.
 *
 * Correo, ciudad, LinkedIn, GitHub y la descarga del CV. Sin teléfono y sin
 * dirección: el perfil los declara como datos no divulgables, y el sitio
 * respeta la misma regla que el agente.
 */
export default function Contact({ dict }: { dict: Dictionary }) {
  // Lo visible se deriva de las URLs del YAML: si cambia un handle allá, cambia
  // aquí sin que nadie tenga que acordarse de este archivo.
  const handle = (url: string) => new URL(url).pathname.replace(/^\/|\/$/g, "");
  const entries = [
    { label: dict.contact.email, value: contacto.email, href: `mailto:${contacto.email}`, external: false },
    { label: dict.contact.location, value: persona.ubicacion, href: null, external: false },
    { label: dict.contact.linkedin, value: handle(contacto.linkedin), href: contacto.linkedin, external: true },
    { label: dict.contact.github, value: `@${handle(contacto.github)}`, href: contacto.github, external: true },
  ];

  return (
    <section id="contact" className="section">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={dict.contact.eyebrow}
          title={dict.contact.title}
          intro={dict.contact.body}
        />

        <ul className="mt-heading grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((entry) => {
            const inner = (
              <>
                <span className="label block">
                  {entry.label}
                </span>
                <span className="mt-1.5 block truncate text-sm text-fg transition-colors group-hover:text-accent">
                  {entry.value}
                </span>
              </>
            );

            return (
              <li key={entry.label} className="bg-bg">
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
              </li>
            );
          })}
        </ul>

        <div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${contacto.email}`}
              className="btn btn-primary"
            >
              {dict.hero.ctaContact}
              <span aria-hidden="true">→</span>
            </a>
            {/* Apagado hasta que exista el PDF. */}
            {RESUME_URL && (
              <a
                href={RESUME_URL}
                download
                className="btn btn-secondary"
              >
                {dict.contact.resume}
              </a>
            )}
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-subtle text-pretty">
            {dict.contact.languages}
          </p>
        </div>
      </div>
    </section>
  );
}
