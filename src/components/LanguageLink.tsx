"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, type MouseEvent } from "react";

/**
 * El cambio de idioma, con fundido cruzado.
 *
 * Es la única navegación real del sitio. Va por la View Transitions API del
 * navegador: el documento captura el estado viejo, el router carga el nuevo,
 * y el navegador funde uno en otro sin que haya un parpadeo ni un blanco en
 * medio. La duración y la curva viven en globals.css, con el resto.
 *
 * `startViewTransition` espera una promesa que se resuelve cuando el DOM ya
 * cambió; aquí eso es "el pathname es otro". Si el navegador no tiene la API,
 * el `Link` navega como siempre.
 *
 * La posición de lectura se conserva a propósito —`scroll: false` en las dos
 * rutas—: las dos páginas tienen la misma estructura, así que el mismo
 * desplazamiento muestra la misma sección en el otro idioma, y saltar al
 * inicio sería perder el sitio por el que se iba.
 *
 * La entrada del héroe es sólo para la primera carga: el héroe nuevo llega
 * con el fundido, no con su propia animación encima. La señal es
 * `data-navigated` en <html>, pero el layout de `[lang]` se vuelve a montar al
 * cambiar de idioma y React deja el <html> sin ella; por eso la bandera vive
 * en este módulo —sobrevive a la navegación— y el atributo se repone en un
 * layout effect, que corre antes del primer pintado de la página nueva.
 */

let navigated = false;
let settle: (() => void) | null = null;

export default function LanguageLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (navigated) document.documentElement.dataset.navigated = "";
    // El DOM ya es el de la página nueva: el view transition puede cerrar.
    settle?.();
    settle = null;
  }, [pathname]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Modificadores o botón central: pestaña nueva, que lo haga el navegador.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    navigated = true;
    // Con movimiento reducido no hay fundido: el Link navega y la página
    // cambia de golpe, que es lo que esa preferencia pide.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof document.startViewTransition !== "function" || href === pathname) return;

    e.preventDefault();
    document.documentElement.dataset.navigated = "";
    document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          settle = resolve;
          // Si la navegación no llega, el documento no se queda congelado.
          setTimeout(resolve, 1000);
          router.push(href, { scroll: false });
        }),
    );
  };

  return (
    <Link href={href} hrefLang={href.replace("/", "")} className={className} onClick={onClick} scroll={false}>
      {label}
    </Link>
  );
}
