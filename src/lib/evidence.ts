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
export const CV_AGENT_SHA = "ad823278716c9780eef042e7ef08179fdcd133c0";
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
  costReduction: { label: "perfil.yaml:87", href: perfil(87) },
  processHours: { label: "perfil.yaml:83", href: perfil(83) },
  businessUnits: { label: "perfil.yaml:84", href: perfil(84) },
  internalBot: { label: "perfil.yaml:85", href: perfil(85) },
  marginTraceability: { label: "perfil.yaml:97", href: perfil(97) },
  fourAgents: { label: "perfil.yaml:82", href: perfil(82) },
  contractTests: { label: "tests/test_contract.py", href: source("tests/test_contract.py") },
  evalSuite: { label: "evals/golden.yaml", href: source("evals/golden.yaml") },
  publication: { label: "perfil.yaml:147", href: perfil(147) },
  publicationMetrics: { label: "perfil.yaml:145", href: perfil(145) },
  lorealDashboard: { label: "perfil.yaml:129", href: perfil(129) },

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
  paperLimitations: { label: "perfil.yaml:333-344", href: perfil([333, 344]) },
  paperJournal: { label: "Computación y Sistemas", href: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887" },

  // --- Modo de falla: el falso negativo también miente --------------------
  falseNegativeSearch: { label: "app/core.py:329-347", href: source("app/core.py", [329, 347]) },
  guardrailLayers: { label: "perfil.yaml:90", href: perfil(90) },

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
  whatsappSuite: { label: "perfil.yaml:153-168", href: perfil([153, 168]) },
  humanInTheLoop: { label: "perfil.yaml:170-188", href: perfil([170, 188]) },
  deterministicEngine: { label: "perfil.yaml:191-205", href: perfil([191, 205]) },
  webMigration: { label: "perfil.yaml:221-232", href: perfil([221, 232]) },
  mcpServer: { label: "perfil.yaml:91", href: perfil(91) },
  evalStrategy: { label: "perfil.yaml:88", href: perfil(88) },
  redisConcurrency: { label: "perfil.yaml:93", href: perfil(93) },
  cvAgentProject: { label: "perfil.yaml:235-245", href: perfil([235, 245]) },
  saasFlotillas: { label: "perfil.yaml:208-218", href: perfil([208, 218]) },
  cotizador: { label: "perfil.yaml:248-259", href: perfil([248, 259]) },
  research: { label: "perfil.yaml:133-148", href: perfil([133, 148]) },
  education: { label: "perfil.yaml:281-300", href: perfil([281, 300]) },
  /** El ingreso en 2021 y sus dos fuentes: el plan 2020 de ESCOM y el anuncio de ChatGPT. */
  educationContext: { label: "perfil.yaml:291-300", href: perfil([291, 300]) },
  certifications: { label: "perfil.yaml:312-318", href: perfil([312, 318]) },
  presentation: { label: "perfil.yaml:21", href: perfil(21) },
  availability: { label: "perfil.yaml:31", href: perfil(31) },
  thesis: { label: "perfil.yaml:55-67", href: perfil([55, 67]) },
} as const satisfies Record<string, Cite>;

export type CiteKey = keyof typeof CITES;
