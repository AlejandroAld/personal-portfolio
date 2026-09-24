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
export const CV_AGENT_SHA = "7d71acd5a1d9380d35f3639ca0973d3e4038643b";
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
  costReduction: { label: "perfil.yaml:86", href: perfil(86) },
  businessUnits: { label: "perfil.yaml:83", href: perfil(83) },
  internalBot: { label: "perfil.yaml:84", href: perfil(84) },
  marginTraceability: { label: "perfil.yaml:96", href: perfil(96) },
  fourAgents: { label: "perfil.yaml:82", href: perfil(82) },
  contractTests: { label: "tests/test_contract.py", href: source("tests/test_contract.py") },
  evalSuite: { label: "evals/golden.yaml", href: source("evals/golden.yaml") },
  publication: { label: "perfil.yaml:146", href: perfil(146) },
  publicationMetrics: { label: "perfil.yaml:144", href: perfil(144) },
  lorealDashboard: { label: "perfil.yaml:128", href: perfil(128) },

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
  paperLimitations: { label: "perfil.yaml:332-343", href: perfil([332, 343]) },
  paperJournal: { label: "Computación y Sistemas", href: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887" },

  // --- Modo de falla: el falso negativo también miente --------------------
  falseNegativeSearch: { label: "app/core.py:329-347", href: source("app/core.py", [329, 347]) },
  guardrailLayers: { label: "perfil.yaml:89", href: perfil(89) },

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
  whatsappSuite: { label: "perfil.yaml:152-167", href: perfil([152, 167]) },
  humanInTheLoop: { label: "perfil.yaml:169-187", href: perfil([169, 187]) },
  deterministicEngine: { label: "perfil.yaml:190-204", href: perfil([190, 204]) },
  webMigration: { label: "perfil.yaml:220-231", href: perfil([220, 231]) },
  mcpServer: { label: "perfil.yaml:90", href: perfil(90) },
  evalStrategy: { label: "perfil.yaml:87", href: perfil(87) },
  redisConcurrency: { label: "perfil.yaml:92", href: perfil(92) },
  cvAgentProject: { label: "perfil.yaml:234-244", href: perfil([234, 244]) },
  saasFlotillas: { label: "perfil.yaml:207-217", href: perfil([207, 217]) },
  cotizador: { label: "perfil.yaml:247-258", href: perfil([247, 258]) },
  research: { label: "perfil.yaml:132-147", href: perfil([132, 147]) },
  education: { label: "perfil.yaml:280-299", href: perfil([280, 299]) },
  certifications: { label: "perfil.yaml:311-317", href: perfil([311, 317]) },
  presentation: { label: "perfil.yaml:21", href: perfil(21) },
  availability: { label: "perfil.yaml:31", href: perfil(31) },
  thesis: { label: "perfil.yaml:55-67", href: perfil([55, 67]) },

  // --- Cómo trabajo: los cuatro principios, frase y prueba ------------------
  // Van al final de perfil.yaml; al quitar el logro de la línea 83 (7d71acd) todo lo de abajo subió una línea.
  workRealTraffic: { label: "perfil.yaml:372-375", href: perfil([372, 375]) },
  workPersonDecides: { label: "perfil.yaml:376-379", href: perfil([376, 379]) },
  workSimple: { label: "perfil.yaml:380-383", href: perfil([380, 383]) },
  workWithOperators: { label: "perfil.yaml:384-387", href: perfil([384, 387]) },
} as const satisfies Record<string, Cite>;

export type CiteKey = keyof typeof CITES;
