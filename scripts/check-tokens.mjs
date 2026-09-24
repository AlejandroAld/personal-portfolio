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

const cssInOut = css.match(/--ease-in-out:\s*cubic-bezier\(([^)]+)\)/)?.[1].split(",").map(Number);
const tsInOut = ts.match(/EASE_IN_OUT[^=]*=\s*\[([^\]]+)\]/)?.[1].split(",").map(Number);
if (!cssInOut || !tsInOut) errors.push("no encuentro --ease-in-out en globals.css o EASE_IN_OUT en tokens.ts");
else if (cssInOut.join() !== tsInOut.join()) errors.push(`ease-in-out: CSS ${cssInOut.join(",")} ≠ JS ${tsInOut.join(",")}`);

for (const [token, name] of [["--duration-flight", "FLIGHT_MS"], ["--duration-fall", "FALL_MS"], ["--duration-fall-short", "FALL_SHORT_MS"]]) {
  const cssMs = css.match(new RegExp(`${token}:\\s*(\\d+)ms`))?.[1];
  const tsMs = ts.match(new RegExp(`${name}\\s*=\\s*(\\d+)`))?.[1];
  if (!cssMs || !tsMs) errors.push(`no encuentro ${token} en globals.css o ${name} en tokens.ts`);
  else if (cssMs !== tsMs) errors.push(`${name}: CSS ${cssMs}ms ≠ JS ${tsMs}ms`);
}

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
console.log(`tokens de movimiento: curvas y duraciones coinciden en CSS y JS; ${motionTokens.length} tokens, todos en uso`);
