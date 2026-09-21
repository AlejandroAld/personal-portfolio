/**
 * Enlaces de evidencia.
 *
 * Cada afirmación técnica del sitio que se pueda anclar, se ancla: a la línea
 * exacta del código, o a la línea del perfil que es la fuente de verdad.
 *
 * Los enlaces se fijan a un SHA, nunca a `main`. Un enlace a `main` apunta a la
 * línea equivocada en cuanto el archivo cambia, que es justo el modo de falla
 * que esta sección existe para evitar. Para subir a un commit nuevo: cambia el
 * SHA aquí, corre `npm run sync:perfil`, y vuelve a comprobar los números de
 * línea de abajo.
 */

export const CV_AGENT_REPO = "AlejandroAld/cv-agent";
export const CV_AGENT_SHA = "551b2fb3343dd95e002e0181f3386da15d0e65e6";
export const CV_AGENT_URL = `https://github.com/${CV_AGENT_REPO}`;

/** Una línea suelta, o un rango [desde, hasta]. */
export type Line = number | readonly [number, number];

function fragment(line?: Line): string {
  if (line === undefined) return "";
  return Array.isArray(line) ? `#L${line[0]}-L${line[1]}` : `#L${line as number}`;
}

/** Enlace a un archivo del repo del agente, fijado al SHA. */
export function source(path: string, line?: Line): string {
  return `${CV_AGENT_URL}/blob/${CV_AGENT_SHA}/${path}${fragment(line)}`;
}

/** Enlace a la fuente de verdad del contenido de este sitio. */
export function perfil(line?: Line): string {
  return source("data/perfil.yaml", line);
}

export type Cite = { readonly label: string; readonly href: string };

/**
 * Las citas, en un solo lugar. Todos los números de línea verificados contra
 * el SHA fijado arriba; cambiar el SHA obliga a revisarlos.
 */
export const CITES = {
  // --- Métricas de portada ------------------------------------------------
  costReduction: { label: "perfil.yaml:77", href: perfil(77) },
  processHours: { label: "perfil.yaml:73", href: perfil(73) },
  businessUnits: { label: "perfil.yaml:74", href: perfil(74) },
  internalBot: { label: "perfil.yaml:75", href: perfil(75) },
  marginTraceability: { label: "perfil.yaml:87", href: perfil(87) },
  fourAgents: { label: "perfil.yaml:72", href: perfil(72) },
  contractTests: { label: "tests/test_contract.py", href: source("tests/test_contract.py") },
  evalSuite: { label: "evals/golden.yaml", href: source("evals/golden.yaml") },
  publication: { label: "perfil.yaml:137", href: perfil(137) },
  publicationMetrics: { label: "perfil.yaml:135", href: perfil(135) },
  lorealDashboard: { label: "perfil.yaml:119", href: perfil(119) },

  // --- Modo de falla: el 400 de `temperature` -----------------------------
  temperatureDocstring: { label: "app/llm.py:83-89", href: source("app/llm.py", [83, 89]) },
  temperatureProvider: { label: "app/llm.py:5-7", href: source("app/llm.py", [5, 7]) },
  temperatureDemo: { label: "app/main.py:634-635", href: source("app/main.py", [634, 635]) },
  temperatureTest: { label: "tests/test_contract.py:410", href: source("tests/test_contract.py", [410, 431]) },

  // --- Modo de falla: el falso positivo de "core bancario" ----------------
  adjacencyCoverage: { label: "app/core.py:305-313", href: source("app/core.py", [305, 313]) },
  adjacencyInstruction: { label: "app/agent_brain.py:252-263", href: source("app/agent_brain.py", [252, 263]) },
  adjacencyTest: { label: "tests/test_contract.py:824", href: source("tests/test_contract.py", [824, 827]) },
  adjacencyEval: { label: "evals/golden.yaml:122", href: source("evals/golden.yaml", [122, 127]) },

  // --- Modo de falla: no usar RAG -----------------------------------------
  noRagDecision: { label: "app/agent_brain.py:13-16", href: source("app/agent_brain.py", [13, 16]) },
  noRagRationale: { label: "README.md", href: `${CV_AGENT_URL}/blob/${CV_AGENT_SHA}/README.md#contexto-completo-en-el-prompt-no-rag` },

  // --- Modo de falla: la fuga de datos en mi propio paper -----------------
  paperLimitations: { label: "perfil.yaml:307-318", href: perfil([307, 318]) },
  paperJournal: { label: "Computación y Sistemas", href: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887" },

  // --- Modo de falla: el falso negativo también miente --------------------
  falseNegativeSearch: { label: "app/core.py:329-347", href: source("app/core.py", [329, 347]) },
  guardrailLayers: { label: "perfil.yaml:80", href: perfil(80) },

  // --- Arquitectura de la demo --------------------------------------------
  demoEndpoint: { label: "app/main.py:609", href: source("app/main.py", [609, 615]) },
  demoRateLimit: { label: "app/main.py:95-96", href: source("app/main.py", [95, 96]) },
  demoCors: { label: "app/main.py:48", href: source("app/main.py", [46, 51]) },
  demoStateless: { label: "app/main.py:634-640", href: source("app/main.py", [634, 640]) },
  bearerAuth: { label: "app/main.py:403", href: source("app/main.py", [403, 410]) },
  guardrails: { label: "app/agent_brain.py", href: source("app/agent_brain.py") },
  openResponses: { label: "Open Responses", href: "https://www.openresponses.org/specification" },
  agentRepo: { label: "AlejandroAld/cv-agent", href: CV_AGENT_URL },

  // --- Casos de estudio ----------------------------------------------------
  whatsappSuite: { label: "perfil.yaml:143-158", href: perfil([143, 158]) },
  humanInTheLoop: { label: "perfil.yaml:160-178", href: perfil([160, 178]) },
  deterministicEngine: { label: "perfil.yaml:181-195", href: perfil([181, 195]) },
  webMigration: { label: "perfil.yaml:211-222", href: perfil([211, 222]) },
  mcpServer: { label: "perfil.yaml:81", href: perfil(81) },
  evalStrategy: { label: "perfil.yaml:78", href: perfil(78) },
  redisConcurrency: { label: "perfil.yaml:83", href: perfil(83) },
  cvAgentProject: { label: "perfil.yaml:225-235", href: perfil([225, 235]) },
  saasFlotillas: { label: "perfil.yaml:198-208", href: perfil([198, 208]) },
  cotizador: { label: "perfil.yaml:238-249", href: perfil([238, 249]) },
  research: { label: "perfil.yaml:123-138", href: perfil([123, 138]) },
  education: { label: "perfil.yaml:271-274", href: perfil([271, 274]) },
  certifications: { label: "perfil.yaml:286-292", href: perfil([286, 292]) },
  availability: { label: "perfil.yaml:21", href: perfil(21) },
  thesis: { label: "perfil.yaml:45-57", href: perfil([45, 57]) },
} as const satisfies Record<string, Cite>;

export type CiteKey = keyof typeof CITES;
