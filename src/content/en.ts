/**
 * Contenido en inglés.
 *
 * Todo sale de perfil.yaml del repo del agente. Ninguna cifra, fecha ni
 * proyecto se inventa: lo que no está en la fuente de verdad, no está aquí.
 *
 * Las tres métricas de la tira salen del rol actual y están todas en el YAML.
 * Si alguna se quita de la fuente de verdad, se quita de aquí; no se sustituye
 * por una estimación.
 */

import type { Dictionary } from "./dictionary";

const en: Dictionary = {
  complete: true,
  locale: "en",
  localeName: "English",
  htmlLang: "en",

  meta: {
    title: "José Alejandro Aldama Ramos — AI Engineer",
    description:
      "AI Engineer in Guadalajara. I take AI systems to production and keep them running there: four agents with real customer traffic, operating cost cut 92%, evaluation anchored in real failure modes, and a peer-reviewed NLP publication.",
    keywords: [
      "AI Engineer",
      "AI Engineer Mexico",
      "LLM agents in production",
      "agent evaluation",
      "tool calling",
      "MCP",
      "LangGraph",
      "RAG",
      "NLP",
      "José Alejandro Aldama Ramos",
    ],
    ogAlt:
      "José Alejandro Aldama Ramos — AI Engineer. Agents in production, evaluation, and integration with business systems.",
  },

  nav: {
    experience: "Experience",
    projects: "Projects",
    publication: "Publication",
    skills: "Skills",
    contact: "Contact",
    menu: "Open menu",
    close: "Close menu",
    skipToContent: "Skip to content",
    switchTo: "Ver en español",
  },

  hero: {
    eyebrow: "AI Engineer · Guadalajara, Mexico",
    positioning: "I take AI systems to production",
    positioningAccent: "and keep them running there.",
    summary:
      "Technical owner of the generative AI systems in production at an automotive group, with a peer-reviewed publication in NLP behind me. I work the stretch from pilot to production — tool calling against real business systems, evaluation anchored in real failure modes, guardrails, tracing, and cost per interaction.",
    availability:
      "Open to AI engineering roles in Mexico — on-site, hybrid or remote. Available to relocate to Mexico City.",
    ctaContact: "Get in touch",
    ctaProjects: "See the work",
    ctaResume: "Download CV",
  },

  metrics: {
    sourceNote: "Results from my current role at Grupo Dalton.",
    toWord: "to",
    items: [
      {
        value: "−92%",
        countTo: 92,
        prefix: "−",
        suffix: "%",
        label: "monthly operating cost",
        context: "Rebuilt a 180+ node system onto one traceable orchestrator, while the volume handled grew",
        cite: "costReduction",
      },
      {
        // Antes y después literal, no "−79%": la cifra de origen dice cuánto
        // trabajo había ahí, y el porcentaje solo se lo traga.
        value: "10 h",
        before: "48 h",
        countFrom: 48,
        countTo: 10,
        suffix: " h",
        label: "of weekly process time",
        context: "The same operational process, before and after the system",
        cite: "processHours",
      },
      {
        // "Miles" y "alcance nacional" se quedan vagos a propósito: es una
        // decisión de confidencialidad, no una cifra pendiente. Por eso este
        // cuadro no lleva contador: no hay número que animar, y fabricar uno
        // para que la tira quede simétrica sería exactamente lo que el resto
        // de la página promete no hacer.
        value: "Thousands",
        label: "of advisors, nationwide",
        context: "An internal communications bot across the group. The reach stays unquantified, by NDA.",
        cite: "internalBot",
      },
    ],
  },

  experience: {
    eyebrow: "Experience",
    title: "Four years, four rooms",
    present: "Present",
    roles: {
      "exp-dalton": {
        headline: "Cut monthly operating cost 92% while the volume handled grew",
        summary:
          "Technical owner of the generative AI systems in production, end to end: architecture, integration with the business systems, deployment, security, evaluation and monitoring.",
        highlights: [
          "Inherited a system of more than 180 nodes where logic was scattered, context was lost between hops and errors weren't reproducible. Rebuilt it onto a single traceable orchestrator with explicit state — monthly operating cost fell 92%.",
          "The operational process went from taking 48 hours a week to 10.",
          "The systems I run serve four separate business units inside the group.",
          "The internal communications bot runs nationwide and reaches thousands of advisors across the group.",
          "Four conversational agents with real customer traffic on WhatsApp Business API, each with its own session state, tool catalog and conversation store.",
          "Tool calling on self-hosted n8n over Kubernetes with Claude via the Anthropic API on Azure AI Foundry: a dozen-plus custom tools on HTTP endpoints, structured output with JSON Schema, state-machine routing and human escalation.",
          "Evaluation strategy from scratch: an offline suite anchored in real production failure modes that runs on every change and decides whether a prompt change ships or gets reverted.",
          "Anti-hallucination guardrails with output validation that blocks answers not grounded in a tool result, plus reviewer agents that audit before the customer sees anything.",
          "An MCP server in Node on Cloud Run with OAuth and per-role permissions, exposing internal systems as a natural-language connector.",
          "A deterministic state machine on Cloud Functions for the accounting processes that require reproducibility — deliberately with no model in the path.",
          "Before the system, margin calculation left no trail: there was no way to reconstruct how a figure had been reached, so the error rate couldn't be measured at all. The engine gave it an auditable history, which is the precondition for measuring anything.",
          "Access control across the architecture: granular RBAC, least privilege per tool, tenant isolation, and OAuth 2.0 / JWT on every integration touching customer data.",
        ],
      },
      "exp-grupo-ti": {
        headline: "Vector search and RAG inside Oracle APEX, which ships neither natively",
        summary:
          "AI solutions delivered on the client's own infrastructure, in consulting with direct client contact.",
        highlights: [
          "Built ingestion, chunking, embeddings and retrieval inside Oracle APEX on Oracle Cloud — an environment with no native support for vector search or RAG.",
          "Python and JavaScript backends orchestrating data ingestion and computer vision services over REST APIs.",
        ],
      },
      "exp-loreal": {
        headline: "A financial dashboard 40+ non-technical users actually adopted",
        summary: "Data architecture and process automation inside the Microsoft ecosystem.",
        highlights: [
          "An interactive financial dashboard adopted by more than 40 non-technical users, which meant translating analytical results into something a business profile could act on.",
          "A centralized data architecture with automated ETL for financial calculations and sampling, replacing information that had been kept manually and scattered.",
          "Process automation with Power Automate and applications built with Power Apps, with identity management in Microsoft Entra ID.",
        ],
      },
      "exp-ipn": {
        headline: "F1 0.7744 at 0.88 recall on a clinical corpus, published peer-reviewed",
        summary:
          "Research into detecting depression tendency through text analysis on a clinical corpus.",
        highlights: [
          "Trained and compared BERT, RoBERTa and DeBERTa with full fine-tuning in PyTorch on the DAIC-WOZ clinical corpus, labeled with the PHQ-8 instrument.",
          "Hyperparameter search and a 10-run protocol reporting mean and standard deviation instead of single-run results — a single run tells you where the seed landed, not how the model behaves.",
          "Prioritized recall on purpose: in clinical screening a false negative costs more than a false positive.",
          "Deployed the best performing model as an inference API on Amazon SageMaker.",
        ],
      },
    },
  },

  projects: {
    eyebrow: "Projects",
    title: "Seven things I built",
    intro:
      "Production systems at an automotive group, plus what I build on my own time. Code is linked where the repository is public; the rest is my employer's and stays private.",
    inProgress: "In progress",
    viewCode: "View code",
    readPaper: "Read the paper",
    privateRepo: "Private",
    items: {
      "proy-cv-agent": {
        title: "CV agent — an Open Responses server",
        summary:
          "A conversational agent over my own profile, built on the open interoperability spec rather than as a chatbot over a PDF. It implements POST /v1/responses in sync and SSE streaming modes, runs an agent loop with server-side tools, and yields control when a client declares its own function tools.",
        href: "https://github.com/AlejandroAld/cv-agent",
        hrefLabel: "View code",
        featured: true,
        bullets: [
          "The input as the model gets it: the whole profile in the prompt, no retrieval step — so a retriever missing the right chunk stops being a failure mode.",
          "Every tool call with its arguments and result, because tool selection is a decision you should be able to read.",
          "The reasoning before the answer, where the guardrails bite: a gap declared instead of filled, a requirement marked adjacent instead of covered.",
          "Tokens as they leave — real streaming, with the cost and latency of that single interaction.",
        ],
      },
      "proy-agentes-whatsapp": {
        title: "Four conversational agents on WhatsApp Business API",
        summary:
          "Real customer traffic, and agents that execute actions against the business systems instead of only answering. Single-agent tool calling architecture, three-layer context and memory for conversations spanning days under an explicit context-window budget, and Redis on all four for per-conversation concurrency control. The design rule: every decision that must be exact lives in deterministic nodes, never in the model.",
      },
      "proy-plataformas-supervision": {
        title: "Human-in-the-loop supervision platforms",
        summary:
          "Mini CRMs, one per line of business, where a person reviews, validates, approves and corrects what the agent produced before it takes effect. Each one exposes the agent's output queue with full traceability of who approved what and when. Without this layer an agent can work, but nobody outside engineering can answer for it.",
      },
      "proy-motor-financiero": {
        title: "Deterministic financial calculation engine",
        summary:
          "Production financial software, deliberately rule-based because reproducibility and audit were the requirement. A finite state machine on Cloud Functions: periodic interest on the 360-day banking convention with an auditable history, ERP sync, payment triggers and digitally signed documents. Pulls the reference rate from Banxico's public API and respects the business-day calendar.",
      },
      "proy-migracion-web": {
        title: "Angular 9 to Next.js 15, with keys that never reach the browser",
        summary:
          "PageSpeed went from 34 to 96 and LCP from 8.3 seconds to 2.5. A BFF pattern where the browser only calls internal route handlers and API keys live server-side only — made enforceable with automated verification that no key leaks into the bundle, plus an SEO check in CI on every pull request.",
      },
      "proy-saas-flotillas": {
        title: "Multi-tenant fleet management SaaS",
        summary:
          "Tenant isolation through context middleware, hierarchical RBAC with field-level visibility profiles, roles in a tree and a per-module permission matrix. Built on the Next.js App Router with TypeScript in strict mode and schema validation with Zod.",
      },
      "proy-cotizador": {
        title: "Vehicle valuation flow",
        summary:
          "A purchase and valuation agent inside the conversational suite: it gives a private seller a price range for their car and turns the conversation into an appointment. The valuation itself lives outside the model, in deterministic logic — a wrong price range is a business problem, not a conversational detail.",
      },
    },
  },

  publication: {
    eyebrow: "Publication",
    title: "Detection of Tendency to Depression through Text Analysis",
    body:
      "Peer-reviewed research on the DAIC-WOZ clinical corpus of interview transcripts labeled with the PHQ-8 instrument. Full fine-tuning and comparison of BERT, RoBERTa and DeBERTa in PyTorch, decomposing each interview into question-answer pairs to fit the sequence-length limit, with a 10-run protocol reporting mean and standard deviation. BERT won. The best model was deployed as an inference API on Amazon SageMaker.",
    limitations:
      "The paper ships an explicit limitations section, and three of those limitations are mine to own: I oversampled before the split, partitioned by question-answer pair rather than by participant, and evaluated at turn level instead of patient level. The F1 has to be read with all three on top of it. Validation is designed before the experiment, not after.",
    readPaper: "Read the paper",
    results: [
      { value: "0.7744", label: "F1" },
      { value: "0.88", label: "recall" },
      { value: "10", label: "runs, mean and σ" },
    ],
  },

  skills: {
    eyebrow: "Skills",
    title: "What I work with",
  },

  certifications: {
    eyebrow: "Education & certifications",
    title: "Credentials",
    inProgress: "In progress",
    education: "Education",
    gpa: "GPA",
  },

  thinking: {
    eyebrow: "How I think",
    title: "Failure modes I've fixed",
    intro:
      "The interesting part of a system isn't the architecture diagram, it's what broke and what changed because of it.",
    symptom: "What broke",
    fix: "What I did",
    lesson: "What it generalizes to",
    items: [
      {
        id: "my-own-paper",
        title: "Three methodological flaws in my own published paper",
        symptom:
          "I oversampled before the split, so there is data leakage between train and test. I partitioned by question-answer pair instead of by participant, so there is group leakage. And I evaluated at the turn level instead of the patient level, which is the clinical unit that actually matters.",
        fix:
          "I found them after the fact and documented them in the limitations section rather than leaving them for a reader to find. The F1 of 0.7744 has to be read with all three of those on top of it, and I say so whenever I cite the number.",
        lesson:
          "Validation is designed before the experiment, not after it. A number you can't defend is worse than having no number. That's why the evaluation suites I build today are anchored in real production failure modes and not in synthetic cases I invented myself.",
        cites: ["paperLimitations", "paperJournal"],
      },
      {
        id: "concurrency",
        title: "The messaging failure that only shows up with real traffic",
        symptom:
          "Someone sends three short messages in a row instead of one long one. A flow execution is already in flight for that conversation, so the messages that arrive mid-run either get lost or start a second execution that contradicts the first. It's the classic messaging failure mode, and it doesn't appear in any test you write by hand.",
        fix:
          "Per-conversation concurrency control with Redis: messages arriving while an execution is in progress get captured and folded into it rather than racing it. It runs on all four agents.",
        lesson:
          "Real traffic behaves in ways a synthetic transcript never will. That's the same reason my evaluation suites are anchored in production failure modes: the cases worth testing are the ones users found, not the ones I imagined.",
        cites: ["redisConcurrency"],
      },
      {
        id: "banking-core",
        title: "The false positive that would have died in the first interview",
        symptom:
          "A fit-evaluation tool scored requirement coverage as a boolean. A \"banking core\" requirement came back covered — on the strength of \"base-360 banking convention\", which is a day-count convention inside an interest calculation, not integration with a banking core.",
        fix:
          "Coverage now has three states, not two: direct when the term appears in a job title, project name, stack or keyword; adjacent when it only appears inside prose; no evidence when it doesn't appear at all. A contract test pins the case, and an adversarial eval guards the behavior end to end.",
        lesson:
          "A boolean was collapsing two different things into one answer. A banking recruiter catches that stretch on the first follow-up question — and a tool that stretches is worse than no tool, because it's a claim about a real person that fails on contact.",
        cites: ["adjacencyCoverage", "adjacencyTest", "adjacencyEval"],
      },
    ],
  },

  contact: {
    eyebrow: "Contact",
    title: "Let's talk",
    body: "If you're hiring for the stretch between pilot and production — where most AI projects stall — that's the work I've been doing. Happy to go as deep into the technical detail as you want.",
    email: "Email",
    location: "Location",
    linkedin: "LinkedIn",
    github: "GitHub",
    resume: "Download CV",
    languages:
      "Spanish (native) · English (B2, professional working proficiency — fluent technical reading and writing, with a peer-reviewed publication written in English).",
  },

  footer: {
    generated: "Every fact on this page is generated from a single YAML file — the same source of truth my CV agent answers from.",
    generatedLink: "See perfil.yaml",
    builtWith: "Next.js, TypeScript, Tailwind. Hero background is a hand-written WebGL shader.",
  },

  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  terms: {
    // --- Categorías de habilidades ---
    "IA generativa y agentes": "Generative AI & agents",
    "Evaluación, guardarraíles y observabilidad": "Evaluation, guardrails & observability",
    "Machine learning": "Machine learning",
    "APIs de modelos": "Model APIs",
    "Automatización e integración": "Automation & integration",
    "Backend y datos": "Backend & data",
    Frontend: "Frontend",
    "Infraestructura y operación": "Infrastructure & operations",
    Dominio: "Domain",

    // --- IA generativa y agentes ---
    "Diseño de sistemas agénticos y orquestación de herramientas": "Agentic system design and tool orchestration",
    "Contratos de tool / function calling": "Tool / function calling contracts",
    "Gestión de contexto y memoria multi-sesión": "Context and multi-session memory management",
    "Presupuesto de ventana de contexto": "Context-window budgeting",
    "Enrutamiento por máquina de estados": "State-machine routing",
    "Escalamiento a humano": "Human escalation",
    "Agentes revisores y patrones de supervisión": "Reviewer agents and supervision patterns",
    "Arquitecturas RAG": "RAG architectures",
    "Bases de datos vectoriales": "Vector databases",
    "Prompt engineering (chain-of-thought, few-shot, salida estructurada con JSON Schema)":
      "Prompt engineering (chain-of-thought, few-shot, structured output with JSON Schema)",
    "n8n autohospedado en Kubernetes": "Self-hosted n8n on Kubernetes",

    // --- Evaluación, guardarraíles y observabilidad ---
    "Evaluación automatizada de sistemas no deterministas": "Automated evaluation of non-deterministic systems",
    "Datasets de evaluación anclados en fallas de producción": "Eval datasets anchored in production failures",
    "Pruebas de regresión de prompts y herramientas": "Prompt and tool regression testing",
    "Métricas de groundedness y corrección factual": "Groundedness and factual-correctness metrics",
    "Precisión de selección de herramienta": "Tool-selection accuracy",
    "Medición de calidad, costo y latencia por interacción": "Quality, cost and latency measured per interaction",
    "Guardarraíles anti-alucinación y validación de salida": "Anti-hallucination guardrails and output validation",
    "Interfaces de supervisión humana (human-in-the-loop) para revisión, aprobación y corrección de salidas de agentes":
      "Human-in-the-loop interfaces for reviewing, approving and correcting agent output",
    "Selección de modelo y análisis de trade-offs": "Model selection and trade-off analysis",
    "Fundamentos de OWASP LLM Top 10": "OWASP LLM Top 10 fundamentals",

    // --- Machine learning ---
    "Modelos Transformer": "Transformer models",
    "Fine-tuning completo": "Full fine-tuning",
    "Clasificación supervisada": "Supervised classification",
    "NLP y analítica de texto": "NLP and text analytics",
    "Diseño experimental y reporte de métricas multi-corrida": "Experimental design and multi-run metric reporting",
    "Despliegue de modelos como API de inferencia": "Model deployment as an inference API",

    // --- APIs de modelos ---
    "Claude / API de Anthropic": "Claude / Anthropic API",
    "Modelos open source": "Open-source models",

    // --- Automatización e integración ---
    "n8n autohospedado": "Self-hosted n8n",
    "Diseño de webhooks e idempotencia": "Webhook design and idempotency",
    "APIs REST": "REST APIs",
    "Microsoft Dynamics 365 y Dataverse": "Microsoft Dynamics 365 and Dataverse",
    "Integración con ERP y CRM": "ERP and CRM integration",

    // --- Backend y datos ---
    "Python (tipado, async/await, pruebas, depuración)": "Python (typing, async/await, testing, debugging)",
    "SQL avanzado": "Advanced SQL",
    "Procesos ETL": "ETL pipelines",
    "Cortes sin downtime con blue/green view swap": "Zero-downtime cutovers with blue/green view swap",

    // --- Frontend ---
    "TypeScript en modo estricto": "TypeScript in strict mode",

    // --- Infraestructura y operación ---
    "Git y revisión de código": "Git and code review",
    "RBAC e IAM": "RBAC and IAM",
    "Aislamiento por tenant": "Tenant isolation",
    "Desarrollo asistido con Claude Code": "Claude Code-assisted development",

    // --- Dominio ---
    "Sector automotriz": "Automotive sector",
    "Automatización de procesos financieros con máquinas de estado deterministas":
      "Financial process automation with deterministic state machines",
    "Cálculo de intereses con convención bancaria base 360 e historial auditable":
      "Interest calculation on the base-360 banking convention with an auditable history",
    "Consumo de tasas de referencia desde la API de Banxico": "Reference rates consumed from the Banxico API",

    // --- Stacks de proyectos ---
    "Claude vía API de Anthropic sobre Azure AI Foundry": "Claude via Anthropic API on Azure AI Foundry",
    "Claude vía API de Anthropic sobre Microsoft Azure AI Foundry": "Claude via Anthropic API on Microsoft Azure AI Foundry",
    "API de Banxico": "Banxico API",
    ".NET (consumo de APIs)": ".NET (API consumption)",
    "bases vectoriales": "vector databases",

    // --- Puestos, ubicaciones y estudios ---
    "Desarrollador de Inteligencia Artificial": "Artificial Intelligence Developer",
    "Ingeniero Junior de Inteligencia Artificial": "Junior Artificial Intelligence Engineer",
    "Beauty Tech Intern (TI y Datos)": "Beauty Tech Intern (IT & Data)",
    "Investigador en IA Aplicada — NLP y Deep Learning": "Applied AI Researcher — NLP & Deep Learning",
    "Ingeniería en Inteligencia Artificial": "B.S. Artificial Intelligence Engineering",
    "Guadalajara, Jalisco": "Guadalajara, Jalisco, Mexico",
    "Ciudad de México": "Mexico City, Mexico",
    "Guadalajara, Jalisco, México": "Guadalajara, Jalisco, Mexico",
    "Computación y Sistemas, revista arbitrada, Vol. 29 No. 3, 2025":
      "Computación y Sistemas, peer-reviewed journal, Vol. 29 No. 3, 2025",
  },
};

export default en;
