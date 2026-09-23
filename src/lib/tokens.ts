/**
 * Espejo en JS de los tokens de movimiento que el JS necesita.
 *
 * La fuente es el @theme de src/app/globals.css. `scripts/check-tokens.mjs`
 * comprueba en cada `npm run lint` que las curvas sigan siendo las mismas que
 * `--ease-out` y `--ease-in-out`, y que ningún token de movimiento del CSS se
 * haya quedado sin uso.
 */

/** Entradas: la misma curva que `--ease-out`. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Transiciones: la misma curva que `--ease-in-out`. La cámara vuela con ella. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** El vuelo de la cámara entre nodos: el mismo número que `--duration-flight`. */
export const FLIGHT_MS = 900;
