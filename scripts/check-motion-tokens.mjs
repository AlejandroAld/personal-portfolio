// Compara los tokens de movimiento del CSS con su espejo en JS.
// La fuente es globals.css; motion.ts existe porque `motion` pide segundos y
// arreglos. Si se separan, `npm run lint` falla aquí.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const ts = readFileSync(new URL("../src/lib/motion.ts", import.meta.url), "utf8");

const errors = [];
const cssVar = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) errors.push(`globals.css: falta --${name}`);
  return m?.[1].trim();
};
const tsValue = (re) => {
  const m = ts.match(re);
  if (!m) errors.push(`motion.ts: no encuentro ${re}`);
  return m?.[1];
};
const same = (label, a, b) => {
  if (a !== b) errors.push(`${label}: CSS ${a} ≠ JS ${b}`);
};

const ms = (v) => (v == null ? v : String(parseFloat(v) / 1000));
const bezier = (v) =>
  v == null ? v : v.replace(/^cubic-bezier\(|\)$/g, "").split(",").map((n) => parseFloat(n)).join(",");
const tuple = (v) => (v == null ? v : v.split(",").map((n) => parseFloat(n)).join(","));

same("duration-fast", ms(cssVar("duration-fast")), tsValue(/fast:\s*([\d.]+)/));
same("duration-base", ms(cssVar("duration-base")), tsValue(/base:\s*([\d.]+)/));
same("ease-out", bezier(cssVar("ease-out")), tuple(tsValue(/EASE_OUT[^=]*=\s*\[([^\]]+)\]/)));
same("ease-in-out", bezier(cssVar("ease-in-out")), tuple(tsValue(/EASE_IN_OUT[^=]*=\s*\[([^\]]+)\]/)));
same("distance-sm", String(parseFloat(cssVar("distance-sm"))), tsValue(/sm:\s*(\d+)/));
same("distance", String(parseFloat(cssVar("distance"))), tsValue(/md:\s*(\d+)/));

for (const d of ["distance-sm", "distance"]) {
  const px = parseFloat(cssVar(d));
  if (!(px >= 12 && px <= 20)) errors.push(`${d}: ${px}px fuera del rango 12–20`);
}

if (errors.length) {
  console.error("Tokens de movimiento desalineados:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log("tokens de movimiento: CSS y JS coinciden");
