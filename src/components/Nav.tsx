"use client";

import LanguageLink from "./LanguageLink";
import { useEffect, useState } from "react";

/**
 * Navegación fija.
 *
 * Recibe sólo las cadenas que usa, no el diccionario entero: todo lo que se le
 * pasa a un componente cliente viaja al navegador, y el diccionario completo
 * son decenas de kilobytes que aquí no hacen falta.
 */

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export default function Nav({
  links,
  labels,
  cta,
  languageSwitch,
}: {
  links: readonly NavLink[];
  labels: { menu: string; close: string };
  cta: NavLink | null;
  languageSwitch: NavLink | null;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc cierra el menú: si se puede abrir con teclado, se cierra con teclado.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open ? "border-b border-border bg-nav backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          className="font-mono text-sm font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          aldama<span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Navegación del cliente con fundido cruzado: ver LanguageLink. */}
          {languageSwitch && (
            <LanguageLink
              href={languageSwitch.href}
              label={languageSwitch.label}
              className="rounded-sm px-2 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
            />
          )}

          {cta && (
            <a
              href={cta.href}
              className="hidden rounded-sm border border-accent-line px-3.5 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent-tint sm:inline-block"
            >
              {cta.label}
            </a>
          )}

          <button
            type="button"
            className="-mr-1 p-2 text-fg md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.close : labels.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-nav backdrop-blur-md md:hidden">
          <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 sm:px-6">
            {[...links, ...(cta ? [cta] : [])].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-sm px-2 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
