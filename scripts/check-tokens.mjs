// Dos comprobaciones sobre los tokens de movimiento, en cada `npm run lint`:
//   1. La curva que usa el JS (src/lib/tokens.ts) es la misma que `--ease-out`.
//   2. Ningún token de movimiento del @theme se ha quedado sin uso. Un token
//      muerto es deuda: si nada lo referencia, se borra.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const ts = readFileSync(new URL("../src/lib/tokens.ts", import.meta.url), "utf8");
const errors = [];

const cssEase = css.match(/--ease-out:\s*cubic-bezier\(([^)]+)\)/)?.[1].split(",").map(Number);
const tsEase = ts.match(/EASE_OUT[^=]*=\s*\[([^\]]+)\]/)?.[1].split(",").map(Number);
if (!cssEase || !tsEase) errors.push("no encuentro --ease-out en globals.css o EASE_OUT en tokens.ts");
else if (cssEase.join() !== tsEase.join()) errors.push(`ease-out: CSS ${cssEase.join(",")} ≠ JS ${tsEase.join(",")}`);

const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const motionTokens = [...theme.matchAll(/^\s*(--(?:duration|ease|distance)[\w-]*):/gm)].map((m) => m[1]);
const body = css.replace(theme, "");
for (const t of motionTokens) {
  if (!body.includes(`var(${t})`)) errors.push(`${t} está definido y nada lo usa`);
}
const distance = css.match(/--distance:\s*(\d+)px/)?.[1];
if (distance && !(distance >= 12 && distance <= 20)) errors.push(`--distance: ${distance}px fuera del rango 12–20`);

if (errors.length) {
  console.error("Tokens de movimiento:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`tokens de movimiento: ease-out coincide en CSS y JS; ${motionTokens.length} tokens, todos en uso`);
