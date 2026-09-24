# Mapa de una corrida real del agente de CV

Lo que pasa de verdad cuando `POST /v1/responses` recibe "¿Quién es Alex y por
qué debería contratarlo?", leído del código de
[AlejandroAld/cv-agent](https://github.com/AlejandroAld/cv-agent) en el commit
`ad82327` (el SHA fijado en `src/lib/evidence.ts`). La página cuenta su
recorrido con estos pasos; un paso que no ocurre en el agente no se presenta
como si ocurriera.

| # | Sección | Lo que ocurre en el agente | Dónde |
|---|---|---|---|
| 1 | Petición (héroe) | Llega el POST, se valida el Bearer, se crea el id `resp_…` y se emiten `response.created` y `response.in_progress`. | `app/main.py:403` (endpoint), `:123` (`_autorizado`), `:424` (id), `:474-475` (eventos) |
| 2 | Contexto (formación e idiomas) | Se carga el perfil completo y se aplana a texto: Identidad, Contacto público, Resumen, Experiencia, Proyectos, Habilidades, Educación, Publicaciones, Certificaciones, Respuestas preparadas y Datos que NO debes revelar. Ese texto va entero en `instructions`: no hay recuperación por similitud. El historial se recorta al presupuesto de entrada (24 000 caracteres por defecto). | `app/core.py:402` (`get_profile`), `:172-297` (`como_contexto`, un bloque por sección), `app/agent_brain.py:13-16` (la decisión: sin RAG), `:82` (`construir_system_prompt`), `app/main.py:181-199`, `app/core.py:54` (presupuesto) |
| 3 | **Consulta** (experiencia) | El bucle manda a la Responses API del proveedor el contexto, la pregunta y las cuatro herramientas internas (`buscar_en_perfil`, `obtener_detalle`, `evaluar_encaje`, `obtener_contacto`) con `tool_choice: auto`. El prompt dice: "Para preguntas generales, responde directo con el perfil que ya tienes". Si el modelo llama una herramienta, el servidor la ejecuta y vuelve al bucle (hasta 4 vueltas); el cliente nunca ve esa ejecución, y desde este commit el Response la reporta en `metadata.agent_*`. | `app/main.py:215` (tools), `:227` (bucle), `:234` (`stream_agente`), `:354` (`ejecutar_herramienta`), `app/llm.py:75-107` (cuerpo), `:163` (POST al proveedor), `app/agent_brain.py:63-66` (regla), `:96-183` (las cuatro herramientas), `app/core.py:48` (4 vueltas) |
| 4 | Razonamiento (cómo pienso) | El modelo es de razonamiento; el servidor pide `reasoning.effort` (`minimal` por defecto). Los tokens de razonamiento llegan en `usage.output_tokens_details.reasoning_tokens`; los items de razonamiento vuelven al proveedor en la siguiente vuelta pero nunca salen al cliente. | `app/core.py:52` (effort), `app/llm.py:105` (se manda), `app/openresponses.py:294` (usage), `:165` (`sin_reasoning`), `app/main.py:382` |
| 5 | Verificación (fuentes) | **No es un paso del bucle.** El agente se fundamenta por reglas del prompt (sólo el perfil, sin estimar, sin revelar lo privado); la verificación de esta página es del sitio, en build: `check-claims` y las citas fijadas a un SHA. La página lo cuenta así. | `app/agent_brain.py:25-36` (reglas 1 y 5), `app/core.py:295` (bloque "Datos que NO debes revelar"); en este repo, `scripts/check-claims.mjs` y `src/lib/evidence.ts` |
| 6 | Respuesta (contacto) | El texto sale como `response.output_text.delta`, cierra con `response.output_text.done` y `response.completed` trae `usage` (entrada, salida, razonamiento) y la `metadata` del agente. | `app/main.py:275` (deltas), `:309` (done), `:493` (completed), `app/openresponses.py:232-296` (el objeto Response), `:306-323` (SSE) |

## Lo que la grabación sí y no puede decir

- **Sí:** el id, el modelo, `usage` completo, cada evento SSE con su tiempo,
  el texto final, y desde `ad82327` cuántas herramientas internas corrieron y
  cuánto tardaron (`metadata.agent_tool_calls`, `agent_tools`, `agent_tool_ms`).
- **Sí, calculado sobre el texto exacto:** los tokens de cada bloque del
  contexto, contados con `o200k_base` por `scripts/grabar_corrida.py` desde el
  mismo código que arma el prompt. El total de entrada que manda es el `usage`
  del proveedor, que también se guarda.
- **No:** el `reasoning.effort` con el que corre el servidor desplegado (es
  configuración del contenedor, no viaja en el Response) ni el contenido del
  razonamiento, que el agente nunca expone.

## Propuestas que necesitan tu decisión

1. **Nombre del paso 3.** Para esta pregunta el prompt manda responder directo,
   así que lo esperable es cero llamadas a herramientas. Si la grabación lo
   confirma, el paso se llama **"Consulta"** (el modelo lee la experiencia del
   contexto y consulta al proveedor con las herramientas disponibles pero sin
   usarlas); si la grabación trae llamadas, se llama **"Herramientas"** y las
   muestra con su tiempo. La página elige el nombre según `tool_calls.count`.
2. **Paso 5 como verificación del sitio, no del agente.** La sección cuenta la
   fundamentación por reglas del agente y la verificación de la página
   (check-claims, citas) como dos cosas distintas, y lo dice.
3. **Razonamiento con `effort: minimal`.** Si la corrida reporta 0 tokens de
   razonamiento, el marcador lo dice tal cual ("0 de razonamiento") y el paso 4
   se cuenta como el criterio que rige la respuesta (las reglas del prompt),
   no como un pensamiento largo que no ocurrió.
