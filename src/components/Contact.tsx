import type { Dictionary } from "@/content/dictionary";
import { contacto } from "@/content/perfil";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Contacto.
 *
 * Sin teléfono y sin dirección. No es una omisión: el perfil los declara como
 * datos no divulgables, y el sitio respeta la misma regla que el agente.
 */
export default function Contact({ dict }: { dict: Dictionary }) {
  const links = [
    { label: dict.contact.email, value: contacto.email, href: `mailto:${contacto.email}` },
    { label: dict.contact.linkedin, value: "in/jose-alejandro-aldama-ramos", href: contacto.linkedin },
    { label: dict.contact.github, value: "@AlejandroAld", href: contacto.github },
  ];

  return (
    <section id="contact" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={dict.contact.eyebrow} title={dict.contact.title} intro={dict.contact.body} />

        <Reveal>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {links.map((link) => (
              <li key={link.href} className="bg-bg">
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="group block px-5 py-5 transition-colors hover:bg-surface"
                >
                  <span className="block font-mono text-[0.6875rem] tracking-wide text-subtle uppercase">
                    {link.label}
                  </span>
                  <span className="mt-1.5 block truncate text-sm text-fg transition-colors group-hover:text-accent">
                    {link.value}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-subtle text-pretty">
            {dict.contact.availability}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
