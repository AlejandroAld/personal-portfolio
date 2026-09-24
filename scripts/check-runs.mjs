// Las corridas grabadas del agente (src/content/runs/*.json) tienen que ser
// verdad: forma completa y, cuando están grabadas, contra el agente desplegado.
//
// Una corrida `pending` pasa con aviso: la página lo dice en pantalla y no
// muestra cifras. Una corrida `recorded` contra otro origen (un mock local,
// por ejemplo) NO pasa, salvo con RUNS_ALLOW_LOCAL=1 en una sesión de
// desarrollo: así un fixture no llega a producción por descuido.
import { readFileSync } from "node:fs";

const site = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8");
const AGENT = site.match(/"(https:\/\/[^"]+azurecontainerapps\.io)"/)?.[1];
const errors = [];
const warnings = [];

for (const lang of ["es", "en"]) {
  const run = JSON.parse(readFileSync(new URL(`../src/content/runs/${lang}.json`, import.meta.url), "utf8"));
  const where = `runs/${lang}.json`;
  if (run.schema !== 1) errors.push(`${where}: schema ${run.schema}`);
  if (run.language !== lang) errors.push(`${where}: language ${run.language}`);
  if (typeof run.question !== "string" || !run.question) errors.push(`${where}: falta question`);
  if (!Array.isArray(run.events)) errors.push(`${where}: events no es un arreglo`);

  if (run.status === "pending") {
    warnings.push(`${where}: sin grabación todavía (status pending) — la página no muestra cifras de esta corrida`);
    continue;
  }
  if (run.status !== "recorded") { errors.push(`${where}: status ${run.status}`); continue; }

  if (!run.endpoint?.startsWith(AGENT ?? "\u0000") && process.env.RUNS_ALLOW_LOCAL !== "1") {
    errors.push(`${where}: grabada contra ${run.endpoint}, no contra el agente desplegado (${AGENT}); RUNS_ALLOW_LOCAL=1 sólo en desarrollo`);
  }
  if (!/^[0-9a-f]{40}$/.test(run.cv_agent_sha ?? "")) errors.push(`${where}: cv_agent_sha inválido`);
  if (!run.recorded_at) errors.push(`${where}: falta recorded_at`);
  if (!run.response?.id?.startsWith("resp_")) errors.push(`${where}: response.id inválido`);
  if (run.response?.status !== "completed") errors.push(`${where}: response.status ${run.response?.status}`);
  const u = run.response?.usage ?? {};
  for (const k of ["input_tokens", "output_tokens", "total_tokens"]) if (typeof u[k] !== "number") errors.push(`${where}: usage.${k} falta`);
  const tl = run.timeline_ms ?? {};
  for (const k of ["created", "first_token", "last_token", "completed"]) if (typeof tl[k] !== "number") errors.push(`${where}: timeline_ms.${k} falta`);
  if (!run.events.some((e) => e.type === "response.completed")) errors.push(`${where}: no hay evento response.completed`);
  if (!run.output_text) errors.push(`${where}: output_text vacío`);
  const deltas = run.events.filter((e) => e.type === "response.output_text.delta").map((e) => e.delta ?? "").join("");
  if (deltas !== run.output_text) errors.push(`${where}: los deltas no reconstruyen output_text`);
  if (!run.context?.blocks?.length) errors.push(`${where}: falta context.blocks`);
  if (run.tool_calls && run.tool_calls.reported === false) warnings.push(`${where}: el servidor no reportó herramientas (metadata agent_*); la página no afirma nada sobre ellas`);
}

for (const w of warnings) console.warn("aviso: " + w);
if (errors.length) {
  console.error("corridas grabadas:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`corridas: ${warnings.length ? "forma válida, con avisos" : "las dos grabadas y válidas"}`);
