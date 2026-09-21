/**
 * Espejo en JS de los tokens de movimiento.
 *
 * La fuente es el @theme de src/app/globals.css. `motion` pide segundos y
 * arreglos donde el CSS pide milisegundos y cubic-bezier(), y por eso existe
 * esta copia; `scripts/check-motion-tokens.mjs` la compara con el CSS en cada
 * `npm run lint`, así que no pueden separarse sin que se note.
 */

export const DURATION = {
  /** hover, foco, cambios de estado */
  fast: 0.15,
  /** entradas de elementos */
  base: 0.3,
  /** transiciones de sección */
  slow: 0.5,
} as const;

/** Entradas. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Transiciones. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Desplazamiento de una entrada, en px. El tope es 20. */
export const DISTANCE = {
  /** entradas por scroll */
  sm: 12,
  /** el héroe */
  md: 16,
} as const;

/* Valores del plan que no son tokens: van aquí para no repartirlos. */

/** Escalonado entre hijos de una lista, en segundos, y cuántos se escalonan. */
export const STAGGER = 0.05;
export const STAGGER_MAX = 4;

/** El contador de la tira, en segundos. */
export const COUNT_DURATION = 0.8;
