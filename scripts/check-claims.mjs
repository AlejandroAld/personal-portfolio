// La prosa de los diccionarios no puede afirmar nada que perfil.yaml no
// respalde. Este escáner saca de cada cadena larga de en.ts y es.ts los
// números y los nombres propios (tecnologías, empresas, siglas) y exige que
// cada uno aparezca en src/content/perfil.json, que es el YAML sincronizado.
//
// Lo que declara `terms` cuenta como respaldado: son traducciones de cadenas
// que sí están en el YAML. Una sola clave está exenta, `footer.builtWith`,
// porque describe la página y no a la persona; se verifica contra este repo.
//
// Sale con 1 si queda un solo candidato. Cero candidatos o no pasa el lint.
import { readFileSync } from "node:fs";

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const perfil = norm(readFileSync(new URL("../src/content/perfil.json", import.meta.url), "utf8"));

const MIN = 30; // cadenas más cortas son títulos, botones y etiquetas
const EXEMPT_KEYS = ["builtWith"];

const candidates = [];
for (const file of ["en.ts", "es.ts"]) {
  let src = readFileSync(new URL(`../src/content/${file}`, import.meta.url), "utf8");
  src = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  // Traducciones declaradas: la clave está en el YAML por construcción.
  const termsBlock = src.match(/terms:\s*\{([\s\S]*?)\n\s*\},?\s*\n/)?.[1] ?? "";
  const backedByTerms = norm(termsBlock);

  const backed = (token) => {
    const t = norm(token).replace(/[.]+$/, "");
    return t.length < 2 || perfil.includes(t) || backedByTerms.includes(t);
  };

  for (const m of src.matchAll(/(\w+):\s*(?:\n\s*)?"((?:[^"\\]|\\.)+)"/g)) {
    const [, key, raw] = m;
    if (EXEMPT_KEYS.includes(key)) continue;
    const text = raw.replace(/\\"/g, '"');
    if (text.length < MIN) continue;

    // Números: cifras con decimales, porcentajes, "180+", "48 → 10".
    for (const n of text.matchAll(/(?<![\w.])(\d+(?:[.,]\d+)?)/g)) {
      const num = n[1].replace(",", ".");
      if (!perfil.includes(num) && !perfil.includes(num.replace(".", ","))) {
        candidates.push({ file, key, token: n[1], text });
      }
    }

    // Nombres: con dígito y letra, con mayúscula interna, siglas, o palabra
    // con mayúscula que no abre oración.
    for (const w of text.matchAll(/(?<=^|[\s("'—–/])([A-Za-zÁÉÍÓÚÑáéíóúñ][\w.'+-]*)/g)) {
      // Posesivos y contracciones ("Banxico's", "I've") no son otra palabra.
      const word = w[1].replace(/'(s|ve|re|ll|d|m)$/i, "").replace(/[.,;:'+]+$/, "");
      if (word.length < 2) continue;
      const before = text.slice(0, w.index).trimEnd();
      const opensSentence = before === "" || /[.:;!?—–"(]$/.test(before);
      const hasDigit = /\d/.test(word) && /[A-Za-z]/.test(word);
      const innerCap = /^[A-Za-z].*[A-Z]/.test(word.slice(1)) || /^[a-z]+[A-Z]/.test(word);
      const acronym = /^[A-Z][A-Z0-9.-]+$/.test(word) && word.length >= 2;
      const capMid = /^[A-ZÁÉÍÓÚÑ]/.test(word) && !opensSentence;
      if (!(hasDigit || innerCap || acronym || capMid)) continue;
      if (!backed(word)) candidates.push({ file, key, token: word, text });
    }
  }
}

const seen = new Set();
const unique = candidates.filter((c) => {
  const k = `${c.file}|${c.key}|${c.token}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

if (unique.length) {
  console.error(`prosa sin respaldo en perfil.yaml: ${unique.length} candidatos`);
  for (const c of unique) {
    const i = c.text.indexOf(c.token);
    console.error(`  [${c.file}] ${c.key}: "${c.token}"  …${c.text.slice(Math.max(0, i - 40), i + c.token.length + 30).replace(/\s+/g, " ")}…`);
  }
  process.exit(1);
}
console.log("prosa: todo número y nombre propio de los diccionarios está en perfil.yaml (0 candidatos)");
