/**
 * Espejo en JS del único token de movimiento que el JS necesita.
 *
 * La fuente es el @theme de src/app/globals.css. El contador de la tira es lo
 * único que anima desde JavaScript, y quiere la curva de entrada como cuatro
 * números; `scripts/check-tokens.mjs` comprueba en cada `npm run lint` que
 * sigan siendo los mismos que `--ease-out`, y que ningún token de movimiento
 * del CSS se haya quedado sin uso.
 */

/** Entradas: la misma curva que `--ease-out`. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** El contador de la tira, en segundos. Es un valor del plan, no un token. */
export const COUNT_DURATION = 0.8;
