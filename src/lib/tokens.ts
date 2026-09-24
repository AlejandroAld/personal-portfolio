/**
 * Espejo en JS de los tokens de movimiento que el JS necesita.
 *
 * La fuente es el @theme de src/app/globals.css. `scripts/check-tokens.mjs`
 * comprueba en cada `npm run lint` que las curvas y las duraciones sigan
 * siendo las mismas que en el CSS, y que ningún token de movimiento se haya
 * quedado sin uso.
 */

/** Entradas: la misma curva que `--ease-out`. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Transiciones: la misma curva que `--ease-in-out`. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** La entrada a un nodo, del clic a la sala legible: el mismo número que `--duration-flight`. */
export const FLIGHT_MS = 650;

/** La caída del umbral: el mismo número que `--duration-fall`. */
export const FALL_MS = 1250;

/** El cambio de modo desde el interruptor: la misma caída, en corto (`--duration-fall-short`). */
export const FALL_SHORT_MS = 550;
