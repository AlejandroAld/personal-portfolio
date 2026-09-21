/**
 * Contenido en español.
 *
 * Es el idioma original de perfil.yaml, así que la mayor parte de la prosa sale
 * de ahí casi textual.
 *
 * `terms` va vacío a propósito: los términos del perfil ya están en su idioma,
 * así que cada uno pasa tal cual. Agregar una tecnología al YAML no exige tocar
 * este archivo.
 */

import type { Dictionary } from "./dictionary";
import { persona } from "./perfil";

const es: Dictionary = {
  complete: true,
  locale: "es",
  localeName: "Español",
  htmlLang: "es",

  meta: {
    title: "José Alejandro Aldama Ramos — Ingeniero en IA",
    description:
      "Ingeniero en Inteligencia Artificial en Guadalajara. Llevo sistemas de IA a producción y los sostengo ahí: cuatro agentes con tráfico real de clientes, costo de operación reducido 92%, evaluación anclada en modos de falla reales, y una publicación arbitrada en NLP.",
    keywords: [
      "Ingeniero en Inteligencia Artificial",
      "AI Engineer México",
      "agentes LLM en producción",
      "evaluación de agentes",
      "tool calling",
      "MCP",
      "LangGraph",
      "RAG",
      "NLP",
      "José Alejandro Aldama Ramos",
    ],
    ogAlt:
      "José Alejandro Aldama Ramos — Ingeniero en IA. Agentes en producción, evaluación e integración con sistemas de negocio.",
  },

  nav: {
    experience: "Experiencia",
    projects: "Proyectos",
    publication: "Publicación",
    skills: "Habilidades",
    contact: "Contacto",
    menu: "Abrir menú",
    close: "Cerrar menú",
    skipToContent: "Saltar al contenido",
    switchTo: "View in English",
  },

  hero: {
    eyebrow: "Ingeniero en IA · Guadalajara, México",
    positioning: "Llevo sistemas de IA a producción",
    positioningAccent: "y los sostengo ahí.",
    // Directo del YAML: si cambia allá, cambia aquí sin tocar este archivo.
    summary: persona.presentacion,
    availability: persona.disponibilidad,
    ctaContact: "Hablemos",
    ctaProjects: "Ver el trabajo",
    ctaResume: "Descargar CV",
  },

  metrics: {
    sourceNote: "Resultados del rol actual.",
    items: [
      {
        value: "−92%",
        countTo: 92,
        prefix: "−",
        suffix: "%",
        label: "costo mensual de operación",
        context: "Reconstruí un sistema de más de 180 nodos sobre un orquestador trazable, mientras el volumen atendido crecía",
        cite: "costReduction",
      },
      {
        value: "4",
        countTo: 4,
        label: "agentes en producción",
        context: "Agentes conversacionales con tráfico real de clientes, cada uno con estado de sesión, catálogo de herramientas y almacén de conversación independientes.",
        cite: "fourAgents",
      },
      {
        // "Miles" y "alcance nacional" se quedan vagos a propósito: es una
        // decisión de confidencialidad, no una cifra pendiente. Por eso este
        // cuadro no lleva contador: no hay número que animar, y fabricar uno
        // para que la tira quede simétrica sería exactamente lo que el resto
        // de la página promete no hacer.
        value: "Miles",
        label: "de asesores, alcance nacional",
        context: "Bot de comunicación interna del grupo. El alcance se deja sin cifra, por confidencialidad.",
        cite: "internalBot",
      },
    ],
  },

  experience: {
    eyebrow: "Experiencia",
    title: "Cuatro años, cuatro salas",
    present: "Actualidad",
    roles: {
      "exp-dalton": {
        headline: "Bajé 92% el costo mensual de operación mientras crecía el volumen atendido",
        summary:
          "Responsable técnico de las soluciones de IA generativa en producción, de extremo a extremo: arquitectura, integración con los sistemas de negocio, despliegue, seguridad, evaluación y monitoreo.",
        highlights: [
          "Recibí un sistema de más de 180 nodos donde la lógica estaba repartida, se perdía contexto entre saltos y los errores no eran reproducibles. Lo reconstruí sobre un orquestador único y trazable con estado explícito: el costo mensual de operación bajó 92%.",
          "Bajé un proceso de cálculo de 48 a 10 horas semanales de trabajo manual y lo hice trazable. Antes del sistema el cálculo no dejaba rastro y su tasa de error era inmedible.",
          "Los sistemas que opero dan servicio a cuatro unidades de negocio distintas del grupo.",
          "El bot de comunicación interna tiene alcance nacional y llega a miles de asesores del grupo.",
          "Cuatro agentes conversacionales con tráfico real de clientes sobre WhatsApp Business API, cada uno con su propio estado de sesión, catálogo de herramientas y almacén de conversación.",
          "Tool calling sobre n8n autohospedado en Kubernetes con Claude vía la API de Anthropic en Azure AI Foundry: más de una docena de herramientas propias en endpoints HTTP, salidas estructuradas con JSON Schema, enrutamiento por máquina de estados y escalamiento a humano.",
          "Estrategia de evaluación desde cero: una suite offline anclada en modos de falla reales de producción que corre ante cada cambio y decide si un cambio de prompt sale o se revierte.",
          "Guardarraíles anti-alucinación con validación de salida que bloquea respuestas no sustentadas en el resultado de una herramienta, más agentes revisores que auditan antes de que el cliente vea nada.",
          "Un servidor MCP en Node sobre Cloud Run con OAuth y permisos por rol, que expone sistemas internos como conector para consulta en lenguaje natural.",
          "Una máquina de estados determinista sobre Cloud Functions para los procesos contables que exigen reproducibilidad, deliberadamente sin modelo de por medio.",
          "Control de acceso de toda la arquitectura: RBAC granular, permisos mínimos por herramienta, aislamiento por tenant y OAuth 2.0 / JWT en cada integración que toca datos de clientes.",
        ],
      },
      "exp-grupo-ti": {
        headline: "Búsqueda vectorial y RAG dentro de Oracle APEX, que no soporta ninguna de las dos",
        summary:
          "Entrega de soluciones de IA sobre la infraestructura del propio cliente, en consultoría con trato directo.",
        highlights: [
          "Construí ingesta, chunking, embeddings y recuperación dentro de Oracle APEX sobre Oracle Cloud, un entorno sin soporte nativo para búsqueda vectorial ni para RAG.",
          "Backends en Python y JavaScript para orquestar la ingesta de datos y servicios de visión por computadora vía APIs REST.",
        ],
      },
      "exp-loreal": {
        headline: "Un dashboard financiero que más de 40 usuarios no técnicos sí adoptaron",
        summary: "Arquitectura de datos y automatización de procesos dentro del ecosistema Microsoft.",
        highlights: [
          "Un dashboard financiero interactivo adoptado por más de 40 usuarios no técnicos, lo que implicó traducir resultados analíticos a algo sobre lo que un perfil de negocio pudiera actuar.",
          "Una arquitectura de datos centralizada con procesos ETL automatizados para cálculos financieros y muestreo, sustituyendo información que se mantenía de forma manual y dispersa.",
          "Automatización de procesos con Power Automate y aplicaciones construidas con Power Apps, con gestión de identidad en Microsoft Entra ID.",
        ],
      },
      "exp-ipn": {
        headline: "F1 de 0.7744 con recall de 0.88 sobre corpus clínico, publicado en revista arbitrada",
        summary:
          "Investigación en detección de tendencia a la depresión mediante análisis de texto sobre corpus clínico.",
        highlights: [
          "Entrené y comparé BERT, RoBERTa y DeBERTa con fine-tuning completo en PyTorch sobre el corpus clínico DAIC-WOZ, etiquetado con el instrumento PHQ-8.",
          "Búsqueda de hiperparámetros y un protocolo de 10 corridas reportando media y desviación estándar en vez de resultados de una sola corrida: una corrida te dice dónde cayó la semilla, no cómo se comporta el modelo.",
          "Prioricé recall a propósito: en tamizaje clínico un falso negativo cuesta más que un falso positivo.",
          "Desplegué el mejor modelo como API de inferencia en Amazon SageMaker.",
        ],
      },
    },
  },

  projects: {
    eyebrow: "Proyectos",
    title: "Siete cosas que construí",
    intro:
      "Sistemas en producción en un grupo automotriz, más lo que construyo por mi cuenta. El código va enlazado donde el repositorio es público; el resto es de mi empleador y se queda privado.",
    inProgress: "En construcción",
    viewCode: "Ver el código",
    readPaper: "Leer el artículo",
    privateRepo: "Privado",
    items: {
      "proy-cv-agent": {
        title: "Agente de CV — un servidor Open Responses",
        summary:
          "Un agente conversacional sobre mi propio perfil, construido sobre la especificación abierta de interoperabilidad y no como un chatbot sobre un PDF. Implementa POST /v1/responses en modo síncrono y streaming SSE, ejecuta un bucle agéntico con herramientas del servidor, y cede el control cuando un cliente declara sus propias function tools.",
        hrefLabel: "Ver el código",
        featured: true,
        bullets: [
          "La entrada tal como le llega al modelo: el perfil entero en el prompt, sin paso de recuperación, así que un retriever que falla deja de ser un modo de falla.",
          "Cada llamada a herramienta con sus argumentos y su resultado, porque elegir herramienta es una decisión que deberías poder leer.",
          "El razonamiento previo a la respuesta, donde muerden los guardarraíles: un hueco declarado en vez de rellenado, un requisito marcado adyacente en vez de cubierto.",
          "Los tokens saliendo: streaming real, con el costo y la latencia de esa interacción concreta.",
        ],
      },
      "proy-agentes-whatsapp": {
        title: "Cuatro agentes conversacionales sobre WhatsApp Business API",
        summary:
          "Tráfico real de clientes, y agentes que ejecutan acciones contra los sistemas del negocio en vez de sólo responder. Arquitectura single-agent de tool calling, gestión de contexto y memoria en tres capas para conversaciones de varios días con presupuesto explícito de ventana, y Redis en los cuatro para control de concurrencia por conversación. El criterio de diseño: toda decisión que deba ser exacta vive en nodos deterministas, nunca en el modelo.",
      },
      "proy-plataformas-supervision": {
        title: "Plataformas de supervisión human-in-the-loop",
        summary:
          "Mini CRMs, uno por línea de negocio, donde una persona revisa, valida, aprueba y corrige lo que el agente produjo antes de que tenga efecto. Cada uno expone la cola de salidas del agente con trazabilidad de quién aprobó qué y cuándo. Sin esta capa un agente puede funcionar, pero nadie fuera de ingeniería puede responder por él.",
      },
      "proy-motor-financiero": {
        title: "Motor determinista de cálculo financiero",
        summary:
          "Software financiero en producción, basado en reglas a propósito porque el requerimiento era reproducibilidad y auditoría. Una máquina de estados finita sobre Cloud Functions: intereses periódicos con convención bancaria base 360 e historial auditable, sincronización con ERP, disparadores de pago y documentos firmados digitalmente. Toma la tasa de referencia de la API pública de Banxico y respeta el calendario de días hábiles.",
      },
      "proy-migracion-web": {
        title: "De Angular 9 a Next.js 15, con llaves que nunca llegan al navegador",
        summary:
          "PageSpeed subió de 34 a 96 y el LCP bajó de 8.3 segundos a 2.5. Un patrón BFF donde el navegador sólo llama route handlers internos y las API keys viven exclusivamente del lado servidor, hecho exigible con verificación automatizada de que ninguna llave se filtra al bundle, más un check de SEO en CI en cada pull request.",
      },
      "proy-saas-flotillas": {
        title: "SaaS multi-tenant de administración de flotillas",
        summary:
          "Aislamiento por tenant mediante middleware de contexto, RBAC jerárquico con perfiles de visibilidad a nivel campo, roles en árbol y matriz de permisos por módulo. Construido sobre el App Router de Next.js con TypeScript en modo estricto y validación de esquemas con Zod.",
      },
      "proy-cotizador": {
        title: "Flujo de valuación vehicular",
        summary:
          "Un agente de compra y valuación dentro de la suite conversacional: le entrega a un vendedor particular un rango de precio para su auto y convierte la conversación en una cita. El cálculo de valuación vive fuera del modelo, en lógica determinista: un rango de precio equivocado es un problema de negocio, no un detalle de conversación.",
      },
    },
  },

  publication: {
    eyebrow: "Publicación",
    title: "Detection of Tendency to Depression through Text Analysis",
    body:
      "Investigación arbitrada sobre el corpus clínico DAIC-WOZ de transcripciones de entrevista etiquetadas con el instrumento PHQ-8. Fine-tuning completo y comparación de BERT, RoBERTa y DeBERTa en PyTorch, descomponiendo cada entrevista en pares pregunta-respuesta para caber en el límite de longitud de secuencia, con un protocolo de 10 corridas reportando media y desviación estándar. Ganó BERT. El mejor modelo se desplegó como API de inferencia en Amazon SageMaker.",
    limitations:
      "El artículo lleva una sección explícita de limitaciones, y tres de ellas son mías y las asumo: hice el sobremuestreo antes del split, particioné por par pregunta-respuesta y no por participante, y evalué a nivel turno en vez de a nivel paciente. El F1 hay que leerlo con las tres encima. La validación se diseña antes del experimento, no después.",
    readPaper: "Leer el artículo",
    results: [
      { value: "0.7744", label: "F1" },
      { value: "0.88", label: "recall" },
      { value: "10", label: "corridas, media y σ" },
    ],
  },

  skills: {
    eyebrow: "Habilidades",
    title: "Con qué trabajo",
  },

  certifications: {
    eyebrow: "Estudios y certificaciones",
    title: "Credenciales",
    inProgress: "En curso",
    education: "Estudios",
    list: "Certificaciones",
    gpa: "Promedio",
  },

  thinking: {
    eyebrow: "Cómo pienso",
    title: "Modos de falla que he resuelto",
    intro:
      "La parte interesante de un sistema no es el diagrama de arquitectura, es qué se rompió y qué cambió por eso.",
    symptom: "Qué se rompió",
    fix: "Qué hice",
    lesson: "A qué generaliza",
    items: [
      {
        id: "my-own-paper",
        title: "Tres debilidades metodológicas en mi propia publicación",
        symptom:
          "Hice el sobremuestreo antes del split, así que hay fuga de datos entre entrenamiento y prueba. Particioné por par pregunta-respuesta y no por participante, así que hay fuga por grupo. Y evalué a nivel turno en vez de a nivel paciente, que es la unidad clínica que de verdad importa.",
        fix:
          "Las identifiqué después y las documenté en la sección de limitaciones, en vez de dejarlas para que las encontrara quien leyera. El F1 de 0.7744 hay que leerlo con las tres encima, y lo digo cada vez que cito el número.",
        lesson:
          "La validación se diseña antes del experimento, no después. Un número que no puedes defender es peor que no tener número. Por eso las suites de evaluación que construyo hoy se anclan en modos de falla reales de producción y no en casos sintéticos que yo mismo inventé.",
        cites: ["paperLimitations", "paperJournal"],
      },
      {
        id: "concurrency",
        title: "El modo de falla de mensajería que sólo aparece con tráfico real",
        symptom:
          "Alguien manda tres mensajes cortos seguidos en vez de uno largo. Ya hay una ejecución del flujo en curso para esa conversación, así que los mensajes que llegan a media corrida o se pierden o arrancan una segunda ejecución que contradice a la primera. Es el modo de falla clásico de mensajería, y no aparece en ninguna prueba que escribas a mano.",
        fix:
          "Control de concurrencia por conversación con Redis: los mensajes que llegan mientras una ejecución está en curso se capturan y se integran a ella en vez de competirle. Corre en los cuatro agentes.",
        lesson:
          "El tráfico real se comporta de formas que una transcripción sintética nunca va a reproducir. Es la misma razón por la que mis suites de evaluación se anclan en fallas de producción: los casos que vale la pena probar son los que encontraron los usuarios, no los que yo imaginé.",
        cites: ["redisConcurrency"],
      },
      {
        id: "banking-core",
        title: "El falso positivo que habría muerto en la primera entrevista",
        symptom:
          "Una herramienta de evaluación de encaje calificaba la cobertura con un booleano. Un requisito de «core bancario» salía cubierto, apoyado en «convención bancaria base 360», que es una convención de conteo de días dentro de un cálculo de intereses, no integración con un core bancario.",
        fix:
          "La cobertura ahora tiene tres estados, no dos: directa cuando el término aparece en un puesto, nombre de proyecto, stack o keyword; adyacente cuando sólo aparece dentro de la prosa; sin evidencia cuando no aparece. Un test de contrato fija el caso y una evaluación adversarial vigila el comportamiento de punta a punta.",
        lesson:
          "Un booleano estaba metiendo dos cosas distintas en la misma respuesta. Un reclutador bancario detecta ese estiramiento en la primera pregunta de seguimiento, y una herramienta que estira es peor que no tener herramienta, porque es una afirmación sobre una persona real que se cae al primer contacto.",
        cites: ["adjacencyCoverage", "adjacencyTest", "adjacencyEval"],
      },
    ],
  },

  contact: {
    eyebrow: "Contacto",
    title: "Hablemos",
    body: "Si estás contratando para el tramo de piloto a producción, que es donde la mayoría de los proyectos de IA se detiene, ese es el trabajo que he estado haciendo. Con gusto entro en todo el detalle técnico que necesites.",
    email: "Correo",
    location: "Ubicación",
    linkedin: "LinkedIn",
    github: "GitHub",
    resume: "Descargar CV",
    languages:
      "Español (nativo) · Inglés (B2, competencia profesional de trabajo: lectura y escritura técnica fluidas, con una publicación arbitrada escrita en inglés).",
  },

  footer: {
    sourceAria: "Fuente: {label} — se abre en una pestaña nueva",
    generated: "Cada dato de esta página se genera desde un solo archivo YAML, la misma fuente de verdad con la que responde mi agente de CV.",
    generatedLink: "Ver perfil.yaml",
    builtWith: "Next.js, TypeScript, Tailwind. El fondo del héroe es un shader de WebGL escrito a mano.",
  },

  months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],

  // Los términos del perfil ya están en español: cada uno pasa tal cual.
  terms: {},
};

export default es;
