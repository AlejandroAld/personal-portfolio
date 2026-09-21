/**
 * Trae `data/perfil.yaml` del repo del agente de CV y lo deja como JSON tipado
 * en `src/content/perfil.json`.
 *
 * El sitio no vuelve a escribir a mano ningún dato estructural (fechas,
 * empresas, stacks, habilidades): los lee de aquí. Así el portafolio no puede
 * desincronizarse de la fuente de verdad, que es exactamente lo que le pasó a
 * la versión anterior del sitio.
 *
 * Se fija a un SHA, no a `main`: los enlaces de evidencia apuntan a líneas
 * concretas, y una línea sólo es estable dentro de un commit.
 *
 *   npm run sync:perfil                 # el SHA fijado en src/lib/evidence.ts
 *   npm run sync:perfil -- <otro-sha>   # subir a un commit nuevo
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse } from "yaml";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "..");
const REPO = "AlejandroAld/cv-agent";
const RUTA_PERFIL = "data/perfil.yaml";

/** Lee el SHA fijado de evidence.ts para no tener dos fuentes del mismo dato. */
async function shaFijado() {
  const src = await readFile(resolve(RAIZ, "src/lib/evidence.ts"), "utf8");
  const m = src.match(/CV_AGENT_SHA\s*=\s*"([0-9a-f]{40})"/);
  if (!m) throw new Error("No encontré CV_AGENT_SHA en src/lib/evidence.ts");
  return m[1];
}

const sha = process.argv[2] ?? (await shaFijado());
if (!/^[0-9a-f]{40}$/.test(sha)) {
  throw new Error(`SHA inválido: ${sha}. Usa el SHA completo de 40 caracteres.`);
}

const url = `https://raw.githubusercontent.com/${REPO}/${sha}/${RUTA_PERFIL}`;
process.stdout.write(`==> ${url}\n`);

const resp = await fetch(url);
if (!resp.ok) {
  throw new Error(`GitHub respondió ${resp.status}. ¿El SHA existe y el repo es público?`);
}

const yaml = await resp.text();
const perfil = parse(yaml);

// Comprobación de forma: si el YAML cambia de estructura prefiero romper aquí,
// en un comando que corro yo, y no en el build o —peor— en la página.
for (const clave of ["persona", "experiencia", "proyectos", "habilidades", "publicaciones"]) {
  if (!perfil[clave]) throw new Error(`Al perfil le falta la clave "${clave}"`);
}

const salida = {
  _meta: {
    fuente: `https://github.com/${REPO}/blob/${sha}/${RUTA_PERFIL}`,
    repo: REPO,
    sha,
    sincronizado: new Date().toISOString().slice(0, 10),
    nota: "Generado por scripts/sync-perfil.mjs. No editar a mano: edita perfil.yaml en el repo del agente y vuelve a sincronizar.",
  },
  ...perfil,
};

const destino = resolve(RAIZ, "src/content/perfil.json");
await writeFile(destino, JSON.stringify(salida, null, 2) + "\n", "utf8");
process.stdout.write(`==> src/content/perfil.json (${perfil.experiencia.length} puestos, ${perfil.proyectos.length} proyectos)\n`);
