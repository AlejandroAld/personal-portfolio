/**
 * Contenido en español.
 *
 * Es el idioma original de perfil.yaml, así que la mayor parte de la prosa sale
 * de ahí casi textual. Las respuestas del agente que aparecen como ejemplo son
 * literalmente las que el perfil fija para esas preguntas: ni una se redactó
 * para esta página.
 *
 * `terms` va vacío a propósito: los términos del perfil ya están en su idioma,
 * así que cada uno pasa tal cual. Agregar una tecnología al YAML no exige tocar
 * este archivo.
 */

import type { Dictionary } from "./dictionary";

const es: Dictionary = {
  complete: true,
  locale: "es",
  localeName: "Español",
  htmlLang: "es",

  meta: {
    title: "José Alejandro Aldama Ramos — Ingeniero en IA",
    description:
      "Ingeniero en Inteligencia Artificial. Llevo sistemas de IA a producción y los sostengo ahí: cuatro agentes con tráfico real de clientes, evaluación anclada en modos de falla reales, guardarraíles, y costo de operación reducido 92%. Cada afirmación de la página enlaza a la línea de donde sale.",
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
    work: "Trabajo",
    agent: "El agente",
    cases: "Casos de estudio",
    thinking: "Cómo pienso",
    track: "Trayectoria",
    contact: "Contacto",
    menu: "Abrir menú",
    close: "Cerrar menú",
    skipToContent: "Saltar al contenido",
    switchTo: "View in English",
  },

  hero: {
    eyebrow: "Ingeniero en IA · Guadalajara, México",
    thesis: "Llevo sistemas de IA a producción",
    thesisAccent: "y los sostengo ahí.",
    summary:
      "Soy el responsable técnico de las soluciones de IA generativa en producción de un grupo automotriz: arquitectura de tool calling contra los sistemas del negocio, gestión de contexto y memoria para conversaciones de varios días, escalamiento a humano, y toda la capa que los mantiene vivos, que es una suite de evaluación anclada en modos de falla reales, pruebas de regresión ante cada cambio, trazabilidad, y medición de costo y latencia por interacción.",
    availability:
      "Abierto a posiciones de ingeniería de IA en México, presencial, híbrido o remoto. Con disponibilidad para reubicarme a Ciudad de México.",
    ctaPrimary: "Dentro de mi agente de CV",
    ctaSecondary: "Hablemos",
    ctaResume: "Descargar CV",
    portraitAlt: "Retrato de José Alejandro Aldama Ramos",
    evidenceNote: "Cada cifra enlaza a la línea de donde sale.",
    metrics: [
      {
        value: "−92%",
        countTo: 92,
        prefix: "−",
        suffix: "%",
        label: "costo mensual de operación",
        detail:
          "Recibí un sistema de más de 180 nodos y lo reconstruí sobre un orquestador único y trazable. El costo bajó mientras el volumen atendido crecía.",
        cite: "costReduction",
      },
      {
        value: "4",
        countTo: 4,
        label: "agentes en producción",
        detail:
          "Tráfico real de clientes sobre WhatsApp Business API, cada uno con su propio estado de sesión, catálogo de herramientas y almacén de conversación.",
        cite: "fourAgents",
      },
      {
        value: "94",
        countTo: 94,
        label: "comprobaciones antes de cada despliegue",
        detail:
          "68 tests de contrato contra un proveedor mock, más 26 casos de evaluación —17 adversariales— que deciden si un cambio de prompt sale o se revierte.",
        cite: "evalSuite",
      },
      {
        value: "Arbitrada",
        label: "Computación y Sistemas · Vol. 29 No. 3, 2025",
        detail:
          "BERT alcanzó F1 de 0.7744 y recall de 0.88 sobre DAIC-WOZ, reportado en 10 corridas en vez de una. El recall se priorizó a propósito.",
        cite: "publicationMetrics",
      },
    ],
  },

  demo: {
    eyebrow: "En construcción",
    title: "Un agente que enseña cómo llega a la respuesta",
    intro:
      "Casi toda demo de agentes te enseña la respuesta y esconde la máquina. Esta se está construyendo para lo contrario: poner el flujo interno completo en pantalla, porque lo que un agente dice es fácil de fingir y lo que decidió no lo es.",

    stagesTitle: "Qué vas a ver",
    stages: [
      {
        title: "La entrada, tal como le llega al modelo",
        body: "El perfil entero, dentro del prompt, sin paso de recuperación en medio. Vas a ver la misma fuente de verdad en la que se apoya la respuesta, no un resumen de ella ni el fragmento que un retriever alcanzó a traer.",
      },
      {
        title: "Cada llamada a herramienta, con argumentos y resultado",
        body: "Qué herramienta eligió el modelo, qué le pasó y qué le devolvió. Elegir herramienta es una decisión, y una decisión que se puede leer es una decisión que se puede juzgar.",
      },
      {
        title: "El razonamiento previo a la respuesta",
        body: "Aquí es donde los guardarraíles de verdad muerden: un hueco declarado en vez de rellenado, una premisa falsa corregida antes de contestar, un requisito marcado como adyacente en vez de cubierto.",
      },
      {
        title: "Los tokens saliendo",
        body: "Streaming real, no una animación de tecleo: los deltas del proveedor reenviados uno a uno. Al lado, el costo y la latencia de esa interacción concreta.",
      },
    ],

    whyTitle: "Por qué enseñar eso",
    why: "Porque un agente vale lo que vale aquello que se niega a afirmar, y eso nunca aparece en la salida. Publicar la transcripción es enseñar un chatbot. Publicar las llamadas a herramienta, la fundamentación y las negativas es enseñar la ingeniería, que es la parte que costó trabajo y la parte por la que vale la pena que me juzguen.",

    ctaRepo: "Leer el código",
    ctaRepoNote:
      "El servidor ya es público: el bucle agéntico, las cinco capas de guardarraíl, los 68 tests de contrato y los 26 casos de evaluación están todos en el repositorio.",

    exampleTitle: "Lo que ya responde",
    exampleNote: "Del perfil — no es una llamada en vivo",
    example: [
      {
        q: "¿Qué no sabes hacer?",
        a: "Varias cosas, y prefiero decirlas antes de que salgan. No he escrito .NET ni C#, ni Rust. No he usado PySpark, Databricks ni Airflow; mi cómputo distribuido ha sido con BigQuery. No he construido agentes de voz, todo mi trabajo conversacional ha sido en texto. Y no he hecho un ejercicio formal de red team contra mis propios agentes, que es una brecha que tengo clara.",
      },
      {
        q: "¿Cómo se supervisa lo que hacen tus agentes?",
        a: "Con tres capas, y la tercera es la que casi nadie construye. La primera es técnica: validación de salida que bloquea respuestas no sustentadas en el resultado de una herramienta, más agentes revisores que auditan antes de que la respuesta llegue al cliente. La segunda es de ingeniería: trazado de cada llamada y una suite de evaluación que corre ante cada cambio. La tercera es humana: construí las plataformas web donde una persona del negocio revisa, valida, aprueba y corrige lo que el agente produce. Son mini CRMs por línea de negocio. Sin esa capa un agente puede funcionar, pero nadie fuera de ingeniería puede responder por él.",
      },
    ],

    architectureTitle: "Lo que ya está construido",
    architecture: [
      {
        title: "Un bucle agéntico, no un prompt",
        body: "Las herramientas del servidor se ejecutan dentro del bucle. Si el cliente declara sus propias function tools y el modelo llama una, el servidor emite un item function_call y cede el control en vez de ejecutarla, que es lo que manda el spec y lo que rompe a un servidor que sólo contempla las suyas.",
        cite: "openResponses",
      },
      {
        title: "Fundamentado, o lo dice",
        body: "Una capa de validación de salida bloquea las respuestas no sustentadas en el resultado de una herramienta. Los huecos se declaran en vez de rellenarse y las premisas falsas se corrigen antes de responder, que es lo que evita el patrón «¿cuántos años llevas en banca?» seguido de un párrafo inventado.",
        cite: "guardrailLayers",
      },
      {
        title: "Sin RAG, a propósito",
        body: "El perfil entero va en el prompt. Son unos pocos miles de tokens y caben holgados en la ventana de contexto, así que el fallo por recuperación —el modo de falla dominante en un agente de CV— se vuelve imposible en vez de mitigado.",
        cite: "noRagDecision",
      },
      {
        title: "94 comprobaciones antes de salir",
        body: "68 tests de contrato con proveedor mock validan el protocolo: campos requeridos, orden de eventos SSE, monotonía de sequence_number, terminal [DONE] y códigos de error. 26 casos de evaluación, 17 adversariales, atacan alucinación, privacidad, inyección y complacencia.",
        cite: "evalSuite",
      },
      {
        title: "Dos superficies, dos modelos de seguridad",
        body: "El endpoint de Open Responses va protegido por Bearer, para clientes con identidad verificable. El que mira al navegador no lleva credencial y está limitado por IP, porque un token que llega a un navegador es un token público: se protege por consumo, no por identidad.",
        cite: "demoEndpoint",
      },
    ],

    chat: {
      launch: "Empezar la conversación",
      placeholder: "Pregunta por experiencia, stack o una vacante concreta…",
      send: "Enviar",
      sending: "Enviando",
      suggestionsLabel: "Prueba con una de estas",
      suggestions: [
        "¿Qué no sabes hacer?",
        "¿Tienes experiencia integrando con un core bancario?",
        "Evalúa mi vacante: Kubernetes, Terraform, core bancario",
        "¿Cuál ha sido tu error técnico más caro?",
      ],
      you: "Tú",
      agent: "Agente",
      thinking: "Pensando",
      reset: "Empezar de nuevo",
      liveLabel: "En vivo",
      errorGeneric: "El agente no pudo responder. El intercambio guardado de abajo sigue mostrando cómo contesta.",
      errorRateLimit:
        "Llegaste al límite por hora de esta demo pública. Está topada por IP porque una página web no puede guardar una credencial: lo que se protege es el costo, no la identidad. El intercambio guardado de abajo se sigue pudiendo leer.",
      errorOffline: "El agente no responde ahora mismo. El intercambio guardado de abajo se sigue pudiendo leer.",
      transcriptLabel: "Conversación con el agente de CV",
      disclaimer:
        "El endpoint de la demo no lleva credencial y está limitado por IP. El endpoint protegido por Bearer es para clientes de Open Responses, no para esta página.",
    },
  },

  cases: {
    eyebrow: "Casos de estudio",
    title: "Problema, decisión, resultado",
    intro:
      "Cinco trabajos donde la decisión importó más que el stack. El código va enlazado donde el repositorio es público; el resto es de mi empleador y se queda privado.",
    problem: "Problema",
    decision: "Qué decidí, y por qué",
    result: "Resultado",
    stack: "Stack",
    expand: "Leer el caso",
    collapse: "Cerrar",
    viewCode: "Ver el código",
    privateCode: "Repositorio privado",
    alsoTitle: "También en producción",
    items: [
      {
        id: "agent-suite",
        perfilId: "proy-agentes-whatsapp",
        title: "Cuatro agentes conversacionales sobre WhatsApp Business API",
        kicker: "Tráfico real de clientes, y agentes que ejecutan acciones contra los sistemas del negocio en vez de sólo responder.",
        problem:
          "Recibí un sistema de más de 180 nodos donde la lógica estaba repartida por todo el flujo, se perdía contexto entre saltos y los errores no eran reproducibles, así que ninguna falla se podía diagnosticar dos veces igual.",
        decision:
          "Lo reconstruí sobre un orquestador único y trazable con estado explícito: tool calling sobre n8n autohospedado en Kubernetes, con Claude vía la API de Anthropic desplegada en Azure AI Foundry, más de una docena de herramientas propias conectadas a endpoints HTTP, salidas estructuradas con JSON Schema, enrutamiento por máquina de estados y escalamiento a humano. El criterio de diseño central fue sacar del modelo toda decisión que deba ser exacta y dejarla en nodos deterministas, dándole al modelo la comprensión del lenguaje y la conducción de la conversación, y nada que tenga que salir bien al centavo.",
        result:
          "El costo mensual de operación bajó 92% mientras el volumen atendido crecía. La gestión de contexto y memoria en tres capas sostiene conversaciones de varios días bajo un presupuesto explícito de ventana de contexto, con persistencia heterogénea por agente y Redis en los cuatro para control de concurrencia por conversación, que es el modo de falla clásico de mensajería cuando alguien manda varios mensajes cortos seguidos.",
        cite: "whatsappSuite",
      },
      {
        id: "human-in-the-loop",
        perfilId: "proy-plataformas-supervision",
        title: "La capa de supervisión que casi nadie construye",
        kicker: "Mini CRMs donde una persona revisa, valida, aprueba y corrige lo que el agente produjo, antes de que tenga efecto.",
        problem:
          "Un agente puede funcionar y aun así no ser auditable. El trazado y las evaluaciones le responden a ingeniería; fuera de ingeniería nadie podía decir quién aprobó qué, ni corregir una salida mala antes de que llegara a un cliente.",
        decision:
          "Construí una plataforma web por línea de negocio que expone la cola de lo que el agente produjo, con revisión, aprobación, corrección y trazabilidad de quién aprobó qué y cuándo. El criterio de diseño es el mismo que rige toda la arquitectura: el modelo produce un borrador, la persona decide. Next.js y Firebase, RBAC con matriz de permisos por módulo, entornos separados de desarrollo y producción, flujo de ramas con despliegue por merge, y verificación previa a cada paso irreversible.",
        result:
          "En producción con usuarios reales. Es la capa de human-in-the-loop de la operación de agentes, no un tablero de reportes: sin ella los agentes no serían operables ni auditables por el negocio. También soy responsable de la infraestructura que hay detrás: n8n, secretos, webhooks e IAM en ambos entornos.",
        cite: "humanInTheLoop",
      },
      {
        id: "deterministic-engine",
        perfilId: "proy-motor-financiero",
        title: "El motor financiero que deliberadamente no lleva modelo",
        kicker: "Software financiero en producción, basado en reglas a propósito, porque el requerimiento era reproducibilidad y auditoría.",
        problem:
          "Los procesos contables tienen que producir el mismo número dos veces y defenderlo en una auditoría. Un modelo generativo no puede prometer eso, y ninguna cantidad de prompt engineering lo cambia.",
        decision:
          "Dejé el modelo fuera a propósito. Una máquina de estados finita determinista sobre Cloud Functions resuelve el cálculo periódico de intereses con convención bancaria base 360 e historial auditable, la sincronización con ERP, los disparadores de pago y la generación de documentos firmados digitalmente, sobre PostgreSQL y SQL Server. Toma la tasa de referencia de la API pública de Banxico y respeta el calendario de días hábiles.",
        result:
          "La lección de arquitectura generalizó más allá de este proyecto: cualquier cálculo financiero necesita una auditoría que compare el agregado contra una fuente externa, no sólo pruebas unitarias sobre el caso feliz. Las pruebas unitarias confirman que el código hace lo que dice; no atrapan el caso en que lo que dice está mal.",
        cite: "deterministicEngine",
      },
      {
        id: "depression-nlp",
        title: "Detección de tendencia a la depresión a partir de texto",
        kicker: "Investigación arbitrada sobre corpus clínico, y una sección de limitaciones que me tomo en serio.",
        problem:
          "Tamizaje de tendencia a la depresión a partir de transcripciones de entrevista clínica, donde un falso negativo cuesta mucho más que un falso positivo, y donde cada entrevista es mucho más larga que el límite de secuencia de un modelo.",
        decision:
          "Fine-tuning completo y comparación de BERT, RoBERTa y DeBERTa en PyTorch sobre el corpus DAIC-WOZ, transcripciones etiquetadas con el instrumento PHQ-8, descomponiendo cada entrevista en pares pregunta-respuesta para caber en el límite de longitud de secuencia. Búsqueda de hiperparámetros, y un protocolo de 10 corridas reportando media y desviación estándar en vez de una sola corrida: un número de una corrida te dice dónde cayó la semilla, no cómo se comporta el modelo. Prioricé recall a propósito.",
        result:
          "Ganó BERT con F1 de 0.7744 y recall de 0.88. El mejor modelo se desplegó como API de inferencia en Amazon SageMaker, y el trabajo se publicó en Computación y Sistemas, Vol. 29 No. 3, 2025, con sección explícita de metodología y limitaciones. Tres de esas limitaciones son mías y las asumo: están abajo, en Cómo pienso.",
        stack: ["PyTorch", "Hugging Face", "BERT", "RoBERTa", "DeBERTa", "Amazon SageMaker", "Python"],
        repo: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887",
        cite: "research",
      },
      {
        id: "web-migration",
        perfilId: "proy-migracion-web",
        title: "De Angular 9 a Next.js 15, y las llaves que nunca llegan al navegador",
        kicker: "Un sitio público con SSR migrado al App Router contra backends .NET reales.",
        problem:
          "Un sitio público en Angular 9 con renderizado del lado servidor, 34 de PageSpeed y 8.3 segundos de LCP, consumiendo APIs de backend que necesitaban credenciales que el navegador no debe ver nunca.",
        decision:
          "Migré a Next.js 15 con App Router y establecí un patrón BFF: el navegador sólo llama route handlers internos y las API keys viven exclusivamente del lado servidor. Después hice que esa propiedad fuera exigible en vez de aspiracional: verificación automatizada de que ninguna llave se filtra al bundle, más un check de SEO en CI que corre en cada pull request que toca la aplicación.",
        result:
          "PageSpeed subió de 34 a 96 y el LCP bajó de 8.3 segundos a 2.5. Los checks en CI son la parte que dura: un número de rendimiento sin prueba de regresión es una captura de pantalla, no una propiedad.",
        cite: "webMigration",
      },
    ],
    also: [
      {
        title: "Servidor MCP con OAuth y permisos por rol",
        body: "Diseñado y desplegado en Node sobre Cloud Run, expone sistemas internos como conector para consulta en lenguaje natural, con alcance acotado por rol y manejo de excepciones en cada llamada.",
        cite: "mcpServer",
      },
      {
        title: "Estrategia de evaluación, desde cero",
        body: "Una suite offline anclada en modos de falla reales de producción en vez de casos sintéticos, que mide corrección factual contra la fuente de verdad, selección correcta de herramienta y parámetros, y respeto a los límites del agente. Corre como prueba de regresión ante cada cambio.",
        cite: "evalStrategy",
      },
      {
        title: "SaaS multi-tenant de administración de flotillas",
        body: "Aislamiento por tenant mediante middleware de contexto, RBAC jerárquico con perfiles de visibilidad a nivel campo, roles en árbol y matriz de permisos por módulo. Next.js con App Router, TypeScript en modo estricto y validación de esquemas con Zod.",
        cite: "saasFlotillas",
      },
      {
        title: "Flujo de valuación vehicular",
        body: "Un agente de compra y valuación dentro de la suite conversacional: le entrega a un vendedor particular un rango de precio para su auto y convierte la conversación en una cita. El cálculo de valuación vive fuera del modelo, en lógica determinista: un rango de precio equivocado es un problema de negocio, no un detalle de conversación.",
        cite: "cotizador",
      },
    ],
  },

  thinking: {
    eyebrow: "Cómo pienso",
    title: "Modos de falla que he resuelto en producción",
    intro:
      "La parte interesante de un sistema no es el diagrama de arquitectura, es qué se rompió y qué cambió por eso. Cada uno enlaza a la línea exacta.",
    symptom: "Qué se rompió",
    fix: "Qué hice",
    lesson: "A qué generaliza",
    evidence: "Evidencia",
    items: [
      {
        id: "temperature-400",
        title: "El 400 que sólo aparece en producción",
        symptom:
          "El servidor nació sobre Chat Completions y migró al adoptar un modelo de razonamiento. No fue una migración estética: la serie GPT-5 rechaza temperature, top_p y las penalties, usa max_completion_tokens en vez de max_tokens, y para tool calling exige la Responses API. El cuerpo viejo devuelve 400.",
        fix:
          "Lo que manda el cliente y lo que sale al proveedor dejaron de ser lo mismo. temperature se sigue aceptando y se hace eco en el objeto Response —el spec lo pide— pero no viaja. Un test afirma su ausencia en el cuerpo saliente, y el endpoint de la demo ni siquiera expone el control, porque un botón conectado a nada es peor que no tener botón.",
        lesson:
          "Es la clase de campo que alguien vuelve a colar sin querer, y que sólo falla en producción. El test no está por el bug que arreglé; está por el que alguien vuelva a meter el mes que viene.",
        cites: ["temperatureProvider", "temperatureDocstring", "temperatureTest", "temperatureDemo"],
      },
      {
        id: "banking-core",
        title: "El falso positivo que habría muerto en la primera entrevista",
        symptom:
          "La herramienta de evaluación de encaje calificaba la cobertura de cada requisito con un booleano. Un requisito de «core bancario» salía cubierto, apoyado en «convención bancaria base 360», que es una convención de conteo de días dentro de un cálculo de intereses, no integración con un core bancario.",
        fix:
          "La cobertura ahora tiene tres estados, no dos: directa cuando el término aparece en un puesto, nombre de proyecto, stack o keyword; adyacente cuando sólo aparece dentro de la prosa; sin evidencia cuando no aparece. La instrucción que acompaña al resultado le dice al modelo que reporte lo adyacente como adyacente, diga en qué consiste el parecido y qué falta, y nunca lo presente como cubierto. Un test de contrato fija el caso y un caso de evaluación adversarial vigila el comportamiento de punta a punta.",
        lesson:
          "Un booleano estaba metiendo dos cosas distintas en la misma respuesta. Un reclutador bancario detecta ese estiramiento en la primera pregunta de seguimiento, y un agente de CV que estira es peor que no tener agente de CV, porque es una mentira sobre una persona real detectable en la primera entrevista.",
        cites: ["adjacencyCoverage", "adjacencyInstruction", "adjacencyTest", "adjacencyEval"],
      },
      {
        id: "no-rag",
        title: "Decidir no usar RAG",
        symptom:
          "El reflejo por defecto ante «un agente sobre mis documentos» es una base vectorial. Para un CV eso añade un modo de falla nuevo y grave: si el retriever no trae el fragmento correcto, el modelo rellena el hueco, que es exactamente lo que este proyecto no puede permitir.",
        fix:
          "El perfil entero va en el prompt. Un perfil profesional son unos pocos miles de tokens y cabe holgado en la ventana de contexto de cualquier modelo actual. El fallo por recuperación se vuelve imposible en vez de mitigado, la latencia es una llamada en vez de embedding más búsqueda más llamada, no hay índice que mantener sincronizado, y las preguntas transversales ven el perfil completo en lugar de un fragmento.",
        lesson:
          "RAG es la respuesta correcta cuando el corpus no cabe o cambia rápido. Un CV no es ninguna de las dos. Si el perfil creciera a cientos de páginas, la línea de corte sería la ventana de contexto y migraría a búsqueda híbrida manteniendo estas mismas herramientas como interfaz. Saber cuándo no echar mano de la técnica de moda es la decisión técnica; echar mano de ella es el atajo.",
        cites: ["noRagDecision", "noRagRationale"],
      },
      {
        id: "my-own-paper",
        title: "Tres debilidades metodológicas en mi propia publicación",
        symptom:
          "Hice el sobremuestreo antes del split, así que hay fuga de datos entre entrenamiento y prueba. Particioné por par pregunta-respuesta y no por participante, así que hay fuga por grupo. Y evalué a nivel turno en vez de a nivel paciente, que es la unidad clínica que de verdad importa.",
        fix:
          "Las identifiqué después y las documenté en la sección de limitaciones, en vez de dejarlas para que las encontrara quien leyera. El F1 de 0.7744 hay que leerlo con las tres encima, y lo digo cada vez que cito el número.",
        lesson:
          "La validación se diseña antes del experimento, no después. Un número que no puedes defender es peor que no tener número. Por eso las suites de evaluación que construyo hoy se anclan en modos de falla reales de producción y no en casos sintéticos que yo mismo inventé: ya sé lo que cuesta calificar mi propia tarea.",
        cites: ["paperLimitations", "paperJournal"],
      },
      {
        id: "false-negative",
        title: "Un falso negativo también miente",
        symptom:
          "La búsqueda recorría experiencia y proyectos pero no publicaciones. Ante una vacante que pidiera investigación, la evaluación de encaje habría reportado sin evidencia, contra una publicación arbitrada que sí existe.",
        fix:
          "La búsqueda ahora recorre experiencia, proyectos y publicaciones en la misma pasada, cada resultado viaja con la fuerza de su evidencia, y cada uno queda anclado a un registro con id para que la cita sea verificable.",
        lesson:
          "Los guardarraíles anti-alucinación empujan todos en la misma dirección, así que es fácil construir un sistema que sólo pueda fallar hacia el otro lado. Un falso negativo sobre una credencial real hace el mismo daño que una alucinación, y es mucho más fácil que se te pase, porque parece prudencia.",
        cites: ["falseNegativeSearch", "guardrailLayers"],
      },
    ],
  },

  track: {
    eyebrow: "Trayectoria",
    title: "De dónde viene todo esto",
    present: "Actualidad",
    education: "Estudios",
    publication: "Publicación",
    readPaper: "Leer el artículo",
    certifications: "Certificaciones",
    inProgress: "En curso",
    stackTitle: "Stack",
    gpa: "Promedio",
    roles: {
      "exp-dalton": {
        summary:
          "Responsable técnico de las soluciones de IA generativa en producción, de extremo a extremo: arquitectura, integración con los sistemas de negocio, despliegue, seguridad, evaluación y monitoreo.",
        highlights: [
          "Cuatro agentes conversacionales con tráfico real de clientes sobre WhatsApp Business API, cada uno con su propio estado de sesión, catálogo de herramientas y almacén de conversación.",
          "Reconstruí un sistema de más de 180 nodos sobre un orquestador único y trazable con estado explícito: el costo mensual de operación bajó 92% mientras el volumen atendido crecía.",
          "Diseñé desde cero la estrategia de evaluación: una suite offline anclada en modos de falla reales de producción que corre ante cada cambio y decide si un cambio de prompt sale o se revierte.",
          "Diseñé y desplegué un servidor MCP en Node sobre Cloud Run con OAuth y permisos por rol, que expone sistemas internos como conector para consulta en lenguaje natural.",
          "Guardarraíles anti-alucinación con una capa de validación de salida que bloquea respuestas no sustentadas en el resultado de una herramienta, más agentes revisores que auditan antes de que llegue al cliente.",
        ],
      },
      "exp-grupo-ti": {
        summary:
          "Entrega de soluciones de IA sobre la infraestructura del propio cliente, en esquema de consultoría con trato directo.",
        highlights: [
          "Búsqueda vectorial y pipelines de RAG dentro de Oracle APEX sobre Oracle Cloud, un entorno sin soporte nativo para ninguna de las dos: ingesta, chunking, embeddings y recuperación.",
          "Backends en Python y JavaScript para orquestar la ingesta de datos y servicios de visión por computadora vía APIs REST.",
        ],
      },
      "exp-loreal": {
        summary: "Arquitectura de datos y automatización de procesos dentro del ecosistema Microsoft.",
        highlights: [
          "Una arquitectura de datos centralizada con procesos ETL automatizados para cálculos financieros y muestreo, sustituyendo información que se mantenía de forma manual y dispersa.",
          "Un dashboard financiero interactivo adoptado por más de 40 usuarios no técnicos, lo que implicó traducir resultados analíticos a algo sobre lo que un perfil de negocio pudiera actuar.",
          "Automatización de procesos con Power Automate y aplicaciones construidas con Power Apps, con gestión de identidad en Microsoft Entra ID.",
        ],
      },
      "exp-ipn": {
        summary:
          "Investigación en detección de tendencia a la depresión mediante análisis de texto sobre corpus clínico, con publicación arbitrada.",
        highlights: [
          "Entrené y comparé BERT, RoBERTa y DeBERTa con fine-tuning completo en PyTorch sobre el corpus clínico DAIC-WOZ de transcripciones de entrevista etiquetadas con el instrumento PHQ-8.",
          "Búsqueda de hiperparámetros y un protocolo de 10 corridas reportando media y desviación estándar en vez de resultados de una sola corrida. Ganó BERT con F1 de 0.7744 y recall de 0.88; prioricé recall a propósito, porque en tamizaje clínico un falso negativo cuesta más que un falso positivo.",
          "Desplegué el mejor modelo como API de inferencia en Amazon SageMaker.",
        ],
      },
    },
  },

  contact: {
    eyebrow: "Contacto",
    title: "Hablemos",
    body: "Si estás contratando para el tramo de piloto a producción, que es donde la mayoría de los proyectos de IA se detiene, ese es el trabajo que he estado haciendo. Con gusto entro en todo el detalle técnico que necesites.",
    email: "Correo",
    linkedin: "LinkedIn",
    github: "GitHub",
    availability:
      "Español (nativo) · Inglés (B2, competencia profesional de trabajo: lectura y escritura técnica fluidas, con una publicación arbitrada escrita en inglés).",
  },

  footer: {
    sourceNote: "Contenido generado desde perfil.yaml, la misma fuente de verdad con la que responde el agente.",
    builtWith: "Next.js, TypeScript y Tailwind. Sin librerías de animación.",
    rights: "Todos los derechos reservados.",
  },

  months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],

  // Los términos del perfil ya están en español: cada uno pasa tal cual.
  terms: {},
};

export default es;
