/**
 * Contenido en español — PENDIENTE.
 *
 * La estructura bilingüe ya está completa: la ruta /es construye, el toggle
 * existe, los hreflang y el sitemap salen de `complete`. Lo único que falta es
 * la prosa, que entra en una pasada posterior sin tocar nada de arquitectura.
 *
 * Mientras `complete` sea `false`:
 *   · /es se marca noindex (no se indexa media página en el idioma equivocado)
 *   · queda fuera del sitemap y de los hreflang alternates
 *   · el selector de idioma no lo ofrece, aunque la ruta funciona para revisar
 *
 * Para terminarlo: traduce los bloques desde perfil.yaml —que ya está en
 * español, así que la mayoría es copiar— y pon `complete: true`. Nada más.
 */

import type { Dictionary } from "./dictionary";
import en from "./en";

const es: Dictionary = {
  ...en,

  complete: false,
  locale: "es",
  localeName: "Español",
  htmlLang: "es",

  // Lo que ya es correcto en español. El resto hereda del inglés a propósito:
  // un texto sin traducir se ve, y eso es mejor que una cadena vacía.
  nav: {
    work: "Trabajo",
    agent: "Agente en vivo",
    cases: "Casos de estudio",
    thinking: "Cómo pienso",
    track: "Trayectoria",
    contact: "Contacto",
    menu: "Abrir menú",
    close: "Cerrar menú",
    skipToContent: "Saltar al contenido",
    switchTo: "View in English",
  },

  months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],

  // En español los términos del perfil ya están en su idioma: el mapa vacío
  // hace que cada uno pase tal cual.
  terms: {},
};

export default es;
