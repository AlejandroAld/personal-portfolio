/**
 * Contenido en inglés.
 *
 * Todo lo de aquí sale de perfil.yaml del repo del agente. Ninguna cifra,
 * fecha ni proyecto se inventa: lo que no está en la fuente de verdad, no
 * está en el sitio. Cada afirmación con número lleva su `cite`.
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
      "AI Engineer. I take AI systems to production and keep them running there: agents with real customer traffic, evaluation anchored in real failure modes, guardrails and cost control. Talk to my CV agent, live.",
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
    ogAlt: "José Alejandro Aldama Ramos — AI Engineer. Agents in production, evaluation, and integration with business systems.",
  },

  nav: {
    work: "Work",
    agent: "Live agent",
    cases: "Case studies",
    thinking: "How I think",
    track: "Track record",
    contact: "Contact",
    menu: "Open menu",
    close: "Close menu",
    skipToContent: "Skip to content",
    switchTo: "Ver en español",
  },

  hero: {
    eyebrow: "AI Engineer · Guadalajara, Mexico",
    thesis: "I take AI systems to production",
    thesisAccent: "and keep them running there.",
    summary:
      "I'm the technical owner of the generative AI systems in production at an automotive group: tool calling against the business systems, context and memory for conversations that span days, human escalation — and the layer that keeps them alive, which is an evaluation suite anchored in real failure modes, regression tests on every change, tracing, and cost and latency measured per interaction.",
    availability:
      "Open to AI engineering roles in Mexico — on-site, hybrid or remote. Available to relocate to Mexico City.",
    ctaPrimary: "Ask my CV agent",
    ctaSecondary: "Get in touch",
    ctaResume: "Download CV",
    portraitAlt: "Portrait of José Alejandro Aldama Ramos",
    evidenceNote: "Every number links to the line it comes from.",
    metrics: [
      {
        value: "−92%",
        countTo: 92,
        prefix: "−",
        suffix: "%",
        label: "monthly operating cost",
        detail:
          "I inherited a 180+ node system and rebuilt it onto a single traceable orchestrator. Cost fell while the volume handled grew.",
        cite: "costReduction",
      },
      {
        value: "4",
        countTo: 4,
        label: "agents in production",
        detail:
          "Real customer traffic on WhatsApp Business API, each with its own session state, tool catalog and conversation store.",
        cite: "fourAgents",
      },
      {
        value: "94",
        countTo: 94,
        label: "checks before every deploy",
        detail:
          "68 contract tests against a mock provider, plus 26 eval cases — 17 of them adversarial — that decide whether a prompt change ships or gets reverted.",
        cite: "evalSuite",
      },
      {
        value: "Peer-reviewed",
        label: "Computación y Sistemas · Vol. 29 No. 3, 2025",
        detail:
          "BERT reached F1 0.7744 and 0.88 recall on DAIC-WOZ, reported over 10 runs instead of one. Recall was prioritized on purpose.",
        cite: "publicationMetrics",
      },
    ],
  },

  demo: {
    eyebrow: "Live demo",
    title: "Ask my CV agent",
    intro:
      "Not a chatbot over a PDF. An Open Responses server with an agent loop, server-side tools over a single source of truth, five guardrail layers and an eval suite that runs in CI before every deploy. Ask it something hard — it's built to say what it doesn't cover.",
    launch: "Start the conversation",
    placeholder: "Ask about experience, stack, or a specific role…",
    send: "Send",
    sending: "Sending",
    suggestionsLabel: "Try one of these",
    suggestions: [
      "What can't you do?",
      "Do you have experience integrating with a banking core?",
      "Evaluate me against this role: Kubernetes, Terraform, banking core",
      "What's the most expensive technical mistake you've made?",
    ],
    you: "You",
    agent: "Agent",
    thinking: "Thinking",
    reset: "Start over",
    liveLabel: "Live",
    errorGeneric: "The agent couldn't answer. The saved exchange below still shows how it responds.",
    errorRateLimit:
      "You've hit the hourly limit for this public demo. It's capped per IP because a web page can't hold a credential — the cost, not the identity, is what gets protected. The saved exchange below is still readable.",
    errorOffline:
      "The agent is unreachable right now. The saved exchange below is still readable.",
    fallbackNote: "Saved exchange — not live",
    transcriptLabel: "Conversation with the CV agent",
    disclaimer:
      "The demo endpoint takes no credential and is rate-limited per IP. The Bearer-protected endpoint is for Open Responses clients, not for this page.",
    fallback: [
      {
        q: "What can't you do?",
        a: "Several things, and I'd rather say them before they come up. I haven't written .NET or C#, or Rust. I haven't used PySpark, Databricks or Airflow; my distributed compute has been BigQuery. I haven't built voice agents — all my conversational work has been in text. And I haven't run a formal red team exercise against my own agents, which is a gap I'm clear about.",
      },
      {
        q: "How is your agents' output supervised?",
        a: "Three layers, and the third is the one almost nobody builds. The first is technical: output validation that blocks answers not grounded in a tool result, plus reviewer agents that audit before the answer reaches the customer. The second is engineering: tracing on every call, and an evaluation suite that runs on every change. The third is human: I built the web platforms where someone from the business reviews, validates, approves and corrects what the agent produces. They're mini CRMs, one per line of business. Without that layer an agent can work, but nobody outside engineering can answer for it.",
      },
    ],
    architecture: [
      {
        title: "An agent loop, not a prompt",
        body: "Server-side tools run inside the loop. If the client declares its own function tools and the model calls one, the server emits a function_call item and yields control instead of executing it — which is what the spec asks for, and what breaks a server that only ever contemplates its own tools.",
        cite: "openResponses",
      },
      {
        title: "Grounded, or it says so",
        body: "An output validation layer blocks answers not backed by a tool result. Gaps get declared rather than filled, and false premises get corrected before the answer — which is what stops the \"how many years in banking?\" pattern followed by an invented paragraph.",
        cite: "guardrailLayers",
      },
      {
        title: "No RAG, on purpose",
        body: "The whole profile goes in the prompt. It's a few thousand tokens and fits comfortably in context, so retrieval failure — the dominant failure mode for a CV agent — becomes impossible rather than mitigated.",
        cite: "noRagDecision",
      },
      {
        title: "94 checks before it ships",
        body: "68 contract tests on a mock provider validate the protocol: required fields, SSE event ordering, sequence_number monotonicity, terminal [DONE], error codes. 26 eval cases, 17 adversarial, attack hallucination, privacy, injection and sycophancy.",
        cite: "evalSuite",
      },
      {
        title: "No credential in your browser",
        body: "This page talks to the demo endpoint, which takes no key and is capped per IP. A token shipped to a browser is a public token, so the demo is protected by consumption instead of identity.",
        cite: "demoEndpoint",
      },
    ],
  },

  cases: {
    eyebrow: "Case studies",
    title: "Problem, decision, result",
    intro:
      "Five pieces of work where the decision mattered more than the stack. Code is linked where the repository is public; the rest is my employer's and stays private.",
    problem: "Problem",
    decision: "What I decided, and why",
    result: "Result",
    stack: "Stack",
    expand: "Read the case",
    collapse: "Collapse",
    viewCode: "View code",
    privateCode: "Private repository",
    alsoTitle: "Also in production",
    items: [
      {
        id: "agent-suite",
        perfilId: "proy-agentes-whatsapp",
        title: "Four conversational agents on WhatsApp Business API",
        kicker: "Real customer traffic, and agents that act on business systems instead of only answering.",
        problem:
          "I inherited a system of more than 180 nodes where the logic was scattered across the flow, context was lost between hops, and errors weren't reproducible — so no failure could be diagnosed twice the same way.",
        decision:
          "I rebuilt it onto a single traceable orchestrator with explicit state: tool calling on self-hosted n8n over Kubernetes, with Claude via the Anthropic API deployed on Azure AI Foundry, more than a dozen custom tools wired to HTTP endpoints, structured output with JSON Schema, state-machine routing and human escalation. The central design rule was to take every decision that has to be exact out of the model and leave it in deterministic nodes, giving the model language understanding and conversation and nothing that must be right to the cent.",
        result:
          "Monthly operating cost fell 92% while the volume handled grew. Three-layer context and memory carry conversations that span days, under an explicit context-window budget, with heterogeneous persistence per agent and Redis on all four for per-conversation concurrency control — the classic messaging failure when someone sends several short messages in a row.",
        cite: "whatsappSuite",
      },
      {
        id: "human-in-the-loop",
        perfilId: "proy-plataformas-supervision",
        title: "The supervision layer nobody builds",
        kicker: "Mini CRMs where a person reviews, validates, approves and corrects what the agent produced — before it takes effect.",
        problem:
          "An agent can work and still be unaccountable. Traces and evals answer to engineering; outside engineering, nobody could say who approved what, or correct a bad output before it reached a customer.",
        decision:
          "I built a web platform per line of business that exposes the queue of what the agent produced, with review, approval, correction, and traceability of who approved what and when. The design rule is the same one that governs the whole architecture: the model drafts, the person decides. Next.js and Firebase, RBAC with a per-module permission matrix, separate development and production environments, branch flow with deploy on merge, and a verification step before anything irreversible.",
        result:
          "In production with real users. It's the human-in-the-loop layer of the agent operation, not a reporting dashboard — without it the agents wouldn't be operable or auditable by the business. I own the infrastructure behind it too: n8n, secrets, webhooks and IAM across both environments.",
        cite: "humanInTheLoop",
      },
      {
        id: "deterministic-engine",
        perfilId: "proy-motor-financiero",
        title: "The financial engine with no model in it",
        kicker: "Production financial software, deliberately rule-based, because reproducibility and audit were the requirement.",
        problem:
          "Accounting processes have to produce the same number twice and defend it in an audit. A generative model cannot promise that, and no amount of prompt engineering changes it.",
        decision:
          "I left the model out on purpose. A deterministic finite state machine on Cloud Functions handles periodic interest calculation on the 360-day banking convention with an auditable history, ERP synchronization, payment triggers and digitally signed document generation, over PostgreSQL and SQL Server. It pulls the reference rate from Banxico's public API and respects the business-day calendar.",
        result:
          "The architecture lesson generalized past this project: any financial calculation needs an audit that compares the aggregate against an external source, not just unit tests over the happy path. Unit tests confirm the code does what it says — they don't catch the case where what it says is wrong.",
        cite: "deterministicEngine",
      },
      {
        id: "depression-nlp",
        title: "Detecting depression tendency from text",
        kicker: "Peer-reviewed research on a clinical corpus — and a limitations section I take seriously.",
        problem:
          "Screening for depression tendency from clinical interview transcripts, where a false negative costs far more than a false positive, and where each interview is far longer than a model's sequence limit.",
        decision:
          "Full fine-tuning and comparison of BERT, RoBERTa and DeBERTa in PyTorch on the DAIC-WOZ corpus, transcripts labeled with the PHQ-8 instrument, decomposing each interview into question-answer pairs to fit the sequence-length limit. Hyperparameter search, and a 10-run protocol reporting mean and standard deviation rather than a single run — a single-run number tells you where the seed landed, not how the model behaves. I prioritized recall on purpose.",
        result:
          "BERT won with F1 0.7744 and 0.88 recall. The best model was deployed as an inference API on Amazon SageMaker, and the work was published in Computación y Sistemas, Vol. 29 No. 3, 2025, with an explicit methodology and limitations section. Three of those limitations are mine to own — they're in How I think, below.",
        stack: ["PyTorch", "Hugging Face", "BERT", "RoBERTa", "DeBERTa", "Amazon SageMaker", "Python"],
        repo: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887",
        cite: "research",
      },
      {
        id: "web-migration",
        perfilId: "proy-migracion-web",
        title: "Angular 9 to Next.js 15, and the keys that never reach the browser",
        kicker: "A public SSR site migrated to the App Router against real .NET backends.",
        problem:
          "A public site on Angular 9 with server-side rendering, scoring 34 on PageSpeed with an 8.3 second LCP, consuming backend APIs that needed credentials the browser must never see.",
        decision:
          "I migrated to Next.js 15 with the App Router and established a BFF pattern: the browser only ever calls internal route handlers, and API keys live exclusively server-side. Then I made that property enforceable rather than aspirational — automated verification that no key leaks into the bundle, plus an SEO check in CI that runs on every pull request touching the app.",
        result:
          "PageSpeed went from 34 to 96 and LCP dropped from 8.3 seconds to 2.5. The checks in CI are the part that lasts: a performance number without a regression test is a screenshot, not a property.",
        cite: "webMigration",
      },
    ],
    also: [
      {
        title: "MCP server with OAuth and per-role permissions",
        body: "Designed and deployed in Node on Cloud Run, exposing internal systems as a connector for natural-language querying, with scope bounded by role and exception handling on every call.",
        cite: "mcpServer",
      },
      {
        title: "Evaluation strategy, from scratch",
        body: "An offline suite anchored in real production failure modes rather than synthetic cases, measuring factual correctness against the source of truth, correct tool and parameter selection, and respect for the agent's limits. It runs as a regression test on every change.",
        cite: "evalStrategy",
      },
      {
        title: "Multi-tenant fleet management SaaS",
        body: "Tenant isolation through context middleware, hierarchical RBAC with field-level visibility profiles, roles in a tree and a per-module permission matrix. Next.js App Router, TypeScript in strict mode, schema validation with Zod.",
        cite: "saasFlotillas",
      },
      {
        title: "Vehicle valuation flow",
        body: "A purchase and valuation agent inside the conversational suite: it gives a private seller a price range for their car and turns the conversation into an appointment. The valuation itself lives outside the model, in deterministic logic — a wrong price range is a business problem, not a conversational detail.",
        cite: "cotizador",
      },
    ],
  },

  thinking: {
    eyebrow: "How I think",
    title: "Failure modes I've fixed in production",
    intro:
      "The interesting part of a system isn't the architecture diagram, it's what broke and what changed because of it. Each one links to the exact line.",
    symptom: "What broke",
    fix: "What I did",
    lesson: "What it generalizes to",
    evidence: "Evidence",
    items: [
      {
        id: "temperature-400",
        title: "The 400 that only fires in production",
        symptom:
          "The server was born on Chat Completions and migrated when it adopted a reasoning model. That wasn't a cosmetic migration: the GPT-5 series rejects temperature, top_p and the penalties, uses max_completion_tokens instead of max_tokens, and requires the Responses API for tool calling. The old body returns 400.",
        fix:
          "What the client sends and what goes out to the provider stopped being the same thing. temperature is still accepted and echoed back in the Response object — the spec asks for that — but it does not travel. A test asserts its absence in the outgoing body, and the demo endpoint doesn't expose the control at all, because a knob wired to nothing is worse than no knob.",
        lesson:
          "It's the class of field someone re-adds without meaning to, and it only fails in production. The test isn't there for the bug I fixed; it's there for the one someone adds back next month.",
        cites: ["temperatureProvider", "temperatureDocstring", "temperatureTest", "temperatureDemo"],
      },
      {
        id: "banking-core",
        title: "The false positive that would have died in the first interview",
        symptom:
          "The fit-evaluation tool scored requirement coverage as a boolean. A \"banking core\" requirement came back covered — on the strength of \"base-360 banking convention\", which is a day-count convention inside an interest calculation, not integration with a banking core.",
        fix:
          "Coverage now has three states, not two: direct when the term appears in a job title, project name, stack or keyword; adjacent when it only appears inside prose; no evidence when it doesn't appear at all. The instruction shipped with the result tells the model to report adjacent as adjacent, say what the resemblance consists of and what's missing, and never present it as covered. A contract test pins the case, and an adversarial eval case guards the behavior end to end.",
        lesson:
          "A boolean was collapsing two different things into one answer. A banking recruiter catches that stretch on the first follow-up question — and a CV agent that stretches is worse than no CV agent, because it's a lie about a real person that's detectable in the first interview.",
        cites: ["adjacencyCoverage", "adjacencyInstruction", "adjacencyTest", "adjacencyEval"],
      },
      {
        id: "no-rag",
        title: "Deciding not to use RAG",
        symptom:
          "The default reflex for \"an agent over my documents\" is a vector database. For a CV that adds a new and serious failure mode: if the retriever doesn't bring back the right chunk, the model fills the gap — which is exactly what this project cannot allow.",
        fix:
          "The whole profile goes in the prompt. A professional profile is a few thousand tokens and fits comfortably in any current model's context window. Retrieval failure becomes impossible rather than mitigated, latency is one call instead of embedding plus search plus call, there's no index to keep in sync, and cross-cutting questions see the whole profile instead of a fragment of it.",
        lesson:
          "RAG is the right answer when the corpus doesn't fit or changes fast. A CV is neither. If the profile grew to hundreds of pages the cutoff would be the context window, and I'd move to hybrid search keeping these same tools as the interface. Knowing when not to reach for the fashionable technique is the technical decision — reaching for it is the shortcut.",
        cites: ["noRagDecision", "noRagRationale"],
      },
      {
        id: "my-own-paper",
        title: "Three methodological flaws in my own published paper",
        symptom:
          "I oversampled before the split, so there is data leakage between train and test. I partitioned by question-answer pair instead of by participant, so there is group leakage. And I evaluated at the turn level instead of the patient level, which is the clinical unit that actually matters.",
        fix:
          "I found them after the fact and documented them in the limitations section rather than leaving them for a reader to find. The F1 of 0.7744 has to be read with all three of those on top of it, and I say so whenever I cite the number.",
        lesson:
          "Validation is designed before the experiment, not after it. A number you can't defend is worse than having no number. That's why the evaluation suites I build today are anchored in real production failure modes and not in synthetic cases I invented myself — I already know what it costs to grade my own homework.",
        cites: ["paperLimitations", "paperJournal"],
      },
      {
        id: "false-negative",
        title: "A false negative lies too",
        symptom:
          "Search walked experience and projects but not publications. Against a role asking for research, the fit evaluation would report no evidence — against a peer-reviewed publication that does exist.",
        fix:
          "Search now walks experience, projects and publications in the same pass, each result travelling with the strength of its evidence, and each anchored to a record with an id so the citation is verifiable.",
        lesson:
          "Anti-hallucination guardrails all pull in one direction, so it's easy to build a system that can only fail the other way. A false negative about a real credential does the same damage as a hallucination — and it's far easier to miss, because it looks like caution.",
        cites: ["falseNegativeSearch", "guardrailLayers"],
      },
    ],
  },

  track: {
    eyebrow: "Track record",
    title: "Where this came from",
    present: "Present",
    education: "Education",
    publication: "Publication",
    readPaper: "Read the paper",
    certifications: "Certifications",
    inProgress: "In progress",
    stackTitle: "Stack",
    gpa: "GPA",
    roles: {
      "exp-dalton": {
        summary:
          "Technical owner of the generative AI systems in production, end to end: architecture, integration with the business systems, deployment, security, evaluation and monitoring.",
        highlights: [
          "Four conversational agents with real customer traffic on WhatsApp Business API, each with its own session state, tool catalog and conversation store.",
          "Rebuilt a 180+ node system onto a single traceable orchestrator with explicit state — monthly operating cost fell 92% while the volume handled grew.",
          "Built the evaluation strategy from scratch: an offline suite anchored in real production failure modes that runs on every change and decides whether a prompt change ships or gets reverted.",
          "Designed and deployed an MCP server in Node on Cloud Run with OAuth and per-role permissions, exposing internal systems as a natural-language connector.",
          "Anti-hallucination guardrails with an output validation layer that blocks answers not grounded in a tool result, plus reviewer agents that audit output before it reaches the customer.",
        ],
      },
      "exp-grupo-ti": {
        summary:
          "AI solutions delivered on the client's own infrastructure, in a consulting arrangement with direct client contact.",
        highlights: [
          "Vector search and RAG pipelines inside Oracle APEX on Oracle Cloud — an environment with native support for neither: ingestion, chunking, embeddings and retrieval.",
          "Python and JavaScript backends orchestrating data ingestion and computer vision services over REST APIs.",
        ],
      },
      "exp-loreal": {
        summary: "Data architecture and process automation inside the Microsoft ecosystem.",
        highlights: [
          "A centralized data architecture with automated ETL for financial calculations and sampling, replacing information that had been maintained manually and scattered.",
          "An interactive financial dashboard adopted by more than 40 non-technical users, which meant translating analytical results into something a business profile could act on.",
          "Process automation with Power Automate and applications built with Power Apps, with identity management in Microsoft Entra ID.",
        ],
      },
      "exp-ipn": {
        summary:
          "Research into detecting depression tendency through text analysis on a clinical corpus, with a peer-reviewed publication.",
        highlights: [
          "Trained and compared BERT, RoBERTa and DeBERTa with full fine-tuning in PyTorch on the DAIC-WOZ clinical corpus of interview transcripts labeled with the PHQ-8 instrument.",
          "Hyperparameter search and a 10-run protocol reporting mean and standard deviation instead of single-run results. BERT won with F1 0.7744 and 0.88 recall; recall was prioritized on purpose, because in clinical screening a false negative costs more than a false positive.",
          "Deployed the best performing model as an inference API on Amazon SageMaker.",
        ],
      },
    },
  },

  contact: {
    eyebrow: "Contact",
    title: "Let's talk",
    body: "If you're hiring for the stretch between pilot and production — where most AI projects stall — that's the work I've been doing. Happy to go as deep into the technical detail as you want.",
    email: "Email",
    linkedin: "LinkedIn",
    github: "GitHub",
    availability:
      "Spanish (native) · English (B2, professional working proficiency — fluent technical reading and writing, with a peer-reviewed publication written in English).",
  },

  footer: {
    sourceNote: "Content generated from perfil.yaml — the same source of truth the agent answers from.",
    builtWith: "Next.js, TypeScript and Tailwind. No animation libraries.",
    rights: "All rights reserved.",
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
    "Firebase (Firestore, Auth, App Hosting)": "Firebase (Firestore, Auth, App Hosting)",

    // --- Puestos y estudios ---
    "Desarrollador de Inteligencia Artificial": "Artificial Intelligence Developer",
    "Ingeniero Junior de Inteligencia Artificial": "Junior Artificial Intelligence Engineer",
    "Beauty Tech Intern (TI y Datos)": "Beauty Tech Intern (IT & Data)",
    "Investigador en IA Aplicada — NLP y Deep Learning": "Applied AI Researcher — NLP & Deep Learning",
    "Ingeniería en Inteligencia Artificial": "B.S. Artificial Intelligence Engineering",
    "Guadalajara, Jalisco": "Guadalajara, Jalisco, Mexico",
    "Ciudad de México": "Mexico City, Mexico",
    "Computación y Sistemas, revista arbitrada, Vol. 29 No. 3, 2025":
      "Computación y Sistemas, peer-reviewed journal, Vol. 29 No. 3, 2025",
  },
};

export default en;
