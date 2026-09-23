# Portafolio — José Alejandro Aldama Ramos

Sitio personal de AI Engineer. Next.js 16 (App Router), TypeScript estricto,
Tailwind v4. Bilingüe, estático.

**En vivo:** https://josealejandroaldamaramos.vercel.app

---

## La idea

El proyecto central del sitio es un agente de CV que no inventa nada sobre mí.
Un sitio que sí lo hiciera sería incoherente, así que el portafolio se construyó
bajo la misma regla: **todo sale de `perfil.yaml`, y lo que se pueda anclar se
ancla a la línea exacta.**

De ahí las dos piezas que definen la arquitectura:

- **`perfil.yaml` es la fuente de verdad, en serio.** Los datos estructurales
  —fechas, empresas, puestos, stacks, habilidades, estudios, publicación— no se
  escriben en este repo. Se sincronizan desde el repo del agente y se leen de
  `src/content/perfil.json`. Corregir una fecha en el YAML la corrige en los dos
  idiomas a la vez.
- **Cada afirmación lleva su cita.** Los enlaces de evidencia van fijados a un
  SHA, nunca a `main`: un enlace a `main` apunta a la línea equivocada en cuanto
  el archivo cambia, que es justo el modo de falla que esa sección existe para
  evitar.

---

## Estructura

```
src/
  app/
    [lang]/            layout raíz, página, imagen OG  (/en y /es, estáticas)
    sitemap.ts         sólo los idiomas terminados
    robots.ts          los pendientes van a Disallow
    globals.css        tokens (@theme), clases de componente, evidencia, reduced-motion
  components/          secciones + islas de cliente:
                         Nav, LanguageLink
                         agent/  RunMarker, AgentStage, AgentScene (WebGL), AgentDiagram (SVG)
                         AgentChat, AgentDemo  ← escritos, SIN publicar
  content/
    perfil.json        GENERADO — no editar a mano
    perfil.ts          acceso tipado + formateo de fechas
    runs/es.json       la corrida grabada del agente, por idioma (ver "La corrida")
    runs/en.json
    runs.ts            acceso tipado a las corridas
    dictionary.ts      la forma del contenido
    en.ts              prosa en inglés  (completo)
    es.ts              prosa en español (completo)
  lib/
    evidence.ts        SHA fijado + todas las citas, en un solo lugar
    agent-graph.ts     el grafo del agente: nodos, aristas y el camino por pasos
    run-progress.ts    un solo observador del scroll: paso actual y avance
    tokens.ts          la curva de entrada, en JS, para el marcador
    bezier.ts          cubic-bezier() como función, 40 líneas
    site.ts            dominio, endpoint del agente, idiomas, banderas
scripts/
  sync-perfil.mjs      trae perfil.yaml del repo del agente
  check-tokens.mjs     lint: la curva del JS es la del CSS y ningún token está muerto
  check-claims.mjs     lint: cada número y nombre propio de la prosa está en perfil.yaml
  check-runs.mjs       lint: las corridas grabadas tienen forma completa y son del agente desplegado
  a11y.mjs             axe-core contra la página construida, 2 idiomas × 4 estados
docs/
  agent-run-map.md     lo que pasa de verdad en una corrida, con archivo:línea
tests/
  agent-demo/          pruebas del cliente del agente, con su README
```

---

## La página es una corrida del agente

La página se cuenta como la ejecución de mi agente de CV respondiendo
"¿Quién es Alex y por qué debería contratarlo?": seis pasos, una sección cada
uno, y al hacer scroll se ve correr al agente. Dos condiciones mandan sobre
todo lo demás:

1. **Es verdad, no una simulación.** Cada paso es algo que el agente hace de
   verdad, con su archivo y línea en `docs/agent-run-map.md`. Lo que se
   reproduce es una corrida grabada contra el agente desplegado
   (`scripts/grabar_corrida.py` en el repo del agente): eventos SSE con
   tiempo, id, `usage`, herramientas y el contexto bloque por bloque. Nada
   corre en vivo, cada visita cuesta cero, y cada número que la página
   muestra —tokens, tiempos, id— sale de ese JSON. Si un dato no está en la
   grabación, no se muestra: mientras `runs/*.json` está `pending`, el
   marcador lo dice y no hay cifras.
2. **Un reclutador con prisa entiende todo sin interactuar.** La primera
   pantalla dice quién soy, qué hago, las tres cifras y cómo contactarme. Todo
   es HTML del servidor: se lee sin JavaScript, sin WebGL y con el 3D todavía
   cargando. La metáfora enmarca el contenido, no lo reemplaza.

| Paso | Sección | Lo que hace el agente |
|---|---|---|
| 1 · Petición | Héroe | Llega el POST, se crea el id, se emite `response.created`. |
| 2 · Contexto | Formación e idiomas | El perfil completo entra a la ventana de contexto, sin recuperación; un bloque por sección del YAML. |
| 3 · Consulta | Experiencia | El modelo recibe contexto, pregunta y las cuatro herramientas; para una pregunta general responde directo. Se llama "Herramientas" sólo si la corrida grabada las llamó. |
| 4 · Razonamiento | Cómo pienso | Tokens de razonamiento reales, si la corrida los reporta. |
| 5 · Verificación | Fuentes | No es un paso del bucle: es la fundamentación por reglas del agente y la verificación de esta página (check-claims, citas), contadas como lo que son. |
| 6 · Respuesta | Contacto | El texto llega por `output_text.delta`; `response.completed` trae el usage. |

Los pasos 1 y 2 están construidos; 3, 4 y 6 conservan por ahora su contenido
de siempre con su número de paso, y el 5 llega con ellos.

**El marcador**, fijo bajo la barra y en monoespaciada, muestra id, paso,
tokens acumulados, tiempo y estado, y avanza con el scroll: la entrada se
carga en el paso 2, el razonamiento en el 4, la salida en el 6. Para lectores
de pantalla sólo anuncia el cambio de paso.

**El escenario** es un solo lienzo fijo detrás de toda la página con el grafo
del agente (`src/lib/agent-graph.ts`), por donde viaja la petición conforme
avanza el scroll. three.js con React Three Fiber, `frameloop="demand"`: sólo
renderiza cuando hay scroll o una transición activa (0 draw calls en reposo,
medido), DPR tope 2 (1.5 en móvil), pausa con la pestaña oculta, y se carga
después del LCP en su propio chunk (**238 KB gzip**, tope 300). Sin WebGL o
con `prefers-reduced-motion`, queda el mismo grafo como SVG del servidor, con
el paso activo resaltado y sin vuelos de cámara; sin JavaScript, el SVG y el
paso 1. Sustituye al shader del héroe: nunca dos contextos WebGL a la vez.

### El agente de CV es una tarjeta

Destaca —ocupa la fila completa y lleva sus viñetas— pero es una entre siete. El
cliente de chat existe, está probado y **no se publica todavía**:

- `src/components/AgentChat.tsx` y `AgentDemo.tsx` se conservan en la rama,
  con sus cadenas en los dos idiomas dentro del propio archivo.
- Nada los importa, así que Next no los mete en ningún chunk servido.
  Verificado en cada build: ni `response.output_text.delta`, ni `agent-input`,
  ni el hostname del agente aparecen en `.next/static/`.
- Las pruebas están en `tests/agent-demo/`, con su README.

La arquitectura de la demo ya está decidida: el navegador hablará **directo**
con `/api/chat`, sin proxy y sin credencial. `/v1/responses` exige Bearer y no
se toca desde el sitio, porque una página web no puede guardar una llave en
secreto: la protección es por consumo, con tope por IP. Un route handler en
medio habría escondido un hostname que no es secreto a cambio de romper esa
protección, porque todo saldría con la IP del servidor.

## Trazabilidad

La página no lleva una cita bajo cada párrafo: eso era ruido. El pie lo explica
una vez, con enlace al YAML. Lo que sí lleva cada bloque con cifra —la tira,
cada puesto, cada modo de falla— es un enlace a su línea exacta, siempre
visible al pie del bloque, en gris y en acento al pasar el cursor o al
enfocarlo. Antes aparecía sólo con hover; en un teléfono no hay hover, y la
prueba de que cada número tiene fuente no puede depender de él. Cada enlace
mide al menos 24 × 24 px, el objetivo táctil mínimo de WCAG 2.2.

Los enlaces van fijados a un SHA, nunca a `main`: un enlace a `main` apunta a
la línea equivocada en cuanto el archivo cambia.

## Bilingüe

`/en` y `/es`, ambas estáticas vía `generateStaticParams`, con `hreflang` y
`x-default`. El selector es un enlace al camino espejo que, cuando el navegador
tiene la View Transitions API, funde una página en la otra sin recargar; sin
ella navega como cualquier enlace.

La bandera `complete` de cada diccionario manda. Mientras sea `false`, ese idioma
queda fuera del sitemap y de los hreflang, se marca `noindex`, y el selector no
lo ofrece —aunque la ruta funciona para revisarla a mano.

**Los dos idiomas están terminados.** La bandera hizo su trabajo: ponerla en
`true` metió el español al sitemap, le quitó el `noindex`, lo sacó del
`Disallow` de robots y encendió el selector en las dos direcciones, sin tocar
una línea de arquitectura.

---

## Tokens

Todo valor de diseño vive en `src/app/globals.css`, en un solo `@theme`:
colores (incluidos `card`, `nav` y `accent-tint`, que antes eran
transparencias sueltas repartidas por los componentes), los tamaños `micro` y
`display-*`, y el ritmo vertical (`section`, `heading`, `anchor`, `meta`).
Ningún componente lleva un número suelto: si hace falta uno nuevo, se nombra
ahí, y si uno deja de usarse, se borra.

Debajo del `@theme` van las clases de componente, una por rol: `.section`,
`.role-grid`, `.eyebrow`, `.label`, `.tag`, `.badge`, `.card` y `.card-hover`,
`.btn` con sus tres variantes, `.dot`, `.nav-link` y `.rise`. Cuando dos elementos significan lo mismo —un eyebrow,
una etiqueta de campo, un badge de estado— llevan la misma clase, y el sitio no
puede tener dos versiones de la misma pieza sin que se note ahí. El "En curso"
de la tarjeta del agente y el de las certificaciones eran dos badges de dos
colores; ahora son uno.

Dos excepciones, documentadas donde viven: los colores del escenario 3D están
fijados en sRGB dentro de `src/components/agent/AgentScene.tsx`, calculados
contra el presupuesto de contraste del texto (abajo), y la imagen OG repite
cuatro hexadecimales porque el renderizador de `next/og` no lee CSS.

`AgentChat` y `AgentDemo` quedan fuera del escaneo de Tailwind (`@source not`):
un componente que no se publica no debe meter clases en el CSS servido.

---

## Animación

Hay un solo momento orquestado —la entrada del héroe al cargar— y lo demás
responde a lo que hace la persona. No hay entradas por scroll ni tarjetas que
se eleven: cada bloque renderiza visible por defecto, sin ningún estado inicial
que dependa de JavaScript para resolverse, y no hay librería de animación. El
JS servido bajó de 207 130 a **172 733 bytes gzip** al quitarla.

Los tokens de movimiento viven en el `@theme` de `globals.css` y son sólo los
que algo usa: `duration-fast` (150 ms: hover, foco, estado), `duration-base`
(300 ms: la entrada del héroe, el borde de una tarjeta, el cambio de idioma),
`ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, `ease-in-out`
`cubic-bezier(0.65, 0, 0.35, 1)` y `distance` (16 px; tope 20). `npm run lint`
falla si un token se queda sin uso, y comprueba que la curva que usa el JS
(`src/lib/tokens.ts`) sea la misma que `--ease-out`.

**Regla dura:** todo lo que se mueve anima sólo `transform` y `opacity`. Los
hovers cambian color, que no dispara layout. Se puede comprobar en el CSS
compilado: un solo `@keyframes`, y ninguna `transition` fuera de color,
opacidad y transform.

| Qué | Cómo |
|---|---|
| Entrada del héroe | Una animación CSS: fade + 16 px, 300 ms, ease-out; la pregunta se escribe palabra por palabra (45 ms entre palabras, sólo opacidad) y la respuesta corta entra en tres tandas a 60 ms (nombre y titular, cifras, contacto). Corre sin JS y arranca en el primer pintado, así que no retrasa el LCP. Sólo en la primera carga: al cambiar de idioma `<html>` lleva `data-navigated` y el héroe nuevo llega con el fundido. |
| Marcador de la corrida | Lo único que anima desde JavaScript: tokens y tiempo acumulados avanzan con `requestAnimationFrame` hacia el valor del paso activo, con la misma curva de entrada (`cubic-bezier()` resuelta en 40 líneas propias, `src/lib/bezier.ts`). El paso y el estado cambian de golpe, y el estado inicial viene en el HTML del servidor. |
| Hovers | Tarjetas: el borde pasa del gris fino al acento en 300 ms, sólo color. Enlaces del nav: un subrayado que crece desde la izquierda, que es un `scaleX` sobre un pseudoelemento. Botones: fondo, 150 ms. Las utilidades `transition-*` de Tailwind heredan los tokens de estado. |
| Cambio de idioma | Fundido cruzado con la View Transitions API a `duration-base`, disparado por `LanguageLink`: sin recarga, sin blanco en medio. La posición de lectura se conserva a propósito (`scroll: false` en las dos rutas): las dos páginas tienen la misma estructura, y el mismo desplazamiento muestra la misma sección en el otro idioma. Sin la API, el enlace navega como siempre. |
| Escenario 3D | El token recorre el grafo conforme avanza el scroll: la posición objetivo sale del paso y de la fracción de sección leída, y el lienzo la persigue con una interpolación corta en el bucle bajo demanda. Sin vuelos de cámara ni entradas por scroll: lo único que se mueve es lo que cambia de estado. Detalle arriba, en "La página es una corrida del agente". |

Con `prefers-reduced-motion: reduce` las animaciones se quitan —no se acortan—:
el héroe aparece entero, el marcador salta a su valor, el borde de la tarjeta
cambia de golpe, el fundido entre idiomas se salta entero, y el lienzo 3D ni
se pide: queda el grafo en SVG con el paso activo marcado.

---

## Medido, no estimado

Lighthouse móvil contra `next build && next start`, 3 corridas por ruta, en
tres momentos: antes del movimiento, con la librería, y sin ella:

| Ruta | Sin animación | Con `motion` | **Sin librería (hoy)** | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|---|
| `/en` | 96 / 96 / 99 | 96 / 99 / 99 | **98 / 99 / 100** | **100** | **100** | **100** |
| `/es` | 99 / 96 / 99 | 96 / 99 / 96 | **100 / 100 / 98** | **100** | **100** | **100** |

Con la librería cada corrida salía 96 o 99 según el LCP cayera en 2.2 s o en
2.8 s. Sin ella el LCP baja a **1.86–1.96 s** y las corridas salen 98–100: los
34 KB de JS que se fueron eran justo los que se ejecutaban antes del primer
pintado útil.

FCP 0.91 s · LCP 1.86–1.96 s · TBT 39 ms · CLS 0.000–0.003

**Con la página como corrida del agente** (Fase 1), medido otro día en el
mismo contenedor y alternando cada corrida con un build de `main`, para
separar lo que es de la rama de lo que es del entorno; 3 corridas por ruta y
rama:

| Ruta | `main` | **Corrida del agente** | LCP `main` | **LCP corrida** |
|---|---|---|---|---|
| `/en` | 98 / 97 / 97 | **97 / 98 / 98** | 2.44 / 2.55 / 2.51 s | **2.53 / 2.50 / 2.50 s** |
| `/es` | 98 / 97 / 98 | **99 / 97 / 100** | 2.41 / 2.50 / 2.43 s | **1.96 / 2.52 / 1.85 s** |

FCP 0.91 s · TBT 22–38 ms · CLS 0.000 en las seis corridas de la rama
(`main`: 0.000–0.003). Ese día el entorno leía `main` medio segundo por encima
de los 1.86–1.96 s de arriba, y la rama queda en el mismo rango que `main`
medido en el mismo momento. Cambia el elemento LCP: antes Chrome tomaba un
enlace del nav o una cifra, porque el titular entraba con opacidad 0 y el LCP
no lo cuenta; ahora es el párrafo de presentación, que se pinta en el primer
pintado. Accesibilidad, buenas prácticas y SEO: 100 en las doce corridas.

JS servido en `/en`, gzip, medido chunk por chunk contra `next start`:

| | JS servido (gzip) |
|---|---|
| Con `motion` (entradas por scroll, elevación de tarjetas) | 207 130 B |
| Sin librería: héroe en CSS, contador con `requestAnimationFrame` | **172 733 B** |
| Corrida del agente: héroe, marcador y escenario; el chunk 3D (237 786 B) va aparte y se pide después del LCP | **175 450 B** + 237 786 B diferidos |

**34 397 bytes gzip menos.** `motion` no aparece en `package.json`, en ningún
import ni en el bundle compilado; la única palabra "motion" que queda es
`prefers-reduced-motion`.

Accesibilidad, con herramientas y no con impresión:

- **Lighthouse, pestaña Accessibility: 100** en `/en` y `/es` (Lighthouse
  13.5, axe 4.13): 25 auditorías pasan, 0 fallan, 10 son manuales, 40 no
  aplican. `color-contrast` pasa con 0 elementos señalados.
- **axe-core 4.13 desde el proyecto** (`npm run a11y`): 0 violaciones WCAG 2.x
  A/AA y 0 de best-practice en 8 estados (2 idiomas × móvil, menú abierto,
  hover de tarjeta, movimiento reducido); 25 reglas pasan. La única regla "por
  revisar" es `color-contrast` sobre los nodos que están encima del escenario
  (el grafo en SVG o el lienzo), porque axe no mide contra un fondo que no es
  un color plano. Esos se miden aparte, abajo.
- **Teclado, con Tab de verdad:** 32 paradas por idioma, las 32 con anillo de
  foco, orden vertical monótono (el DOM es el orden visual), Shift+Tab lo
  recorre al revés, sin trampas de foco. El skip link es la primera parada y
  lleva a `#main`; el menú móvil abre con Enter y cierra con Esc sin soltar el
  foco.
- **Contraste del texto, medido en píxeles renderizados con el escenario 3D
  corriendo.** AA pide 4.5:1; AAA, 7:1; `muted` da 7.72:1 contra el fondo
  plano. El escenario es una dependencia de contraste, con presupuesto: el
  cuerpo de texto (`muted`) tiene que quedar en AAA sobre lo que sea que el
  grafo pinte detrás, y eso fija el píxel más claro permitido bajo un
  bloque de texto en rgb(14, 20, 38). El escenario lo cumple por construcción
  —cada nodo y el token se proyectan a pantalla y, si caen bajo un contenedor
  de texto, pintan por debajo del tope; sólo encienden en el margen derecho o
  entre secciones— y se mide con el lienzo corriendo: se esconde el texto, se
  capturan los contenedores de sección en ocho posiciones de scroll y se toma
  el píxel más claro. Hoy: **7.13:1** en escritorio y **7.11:1** en móvil para
  `muted` (peor caso), `subtle` 5.4:1, `accent` 4.97:1. Si cambian los
  colores del escenario, se vuelve a medir.

Sin JavaScript: de los 375 nodos de texto de `<main>`, **0 ocultos** en los
dos idiomas, y nada en opacidad 0 en reposo; la pregunta, la respuesta corta,
el marcador en su estado inicial y el grafo en SVG vienen en el HTML. Con
`prefers-reduced-motion: reduce`: entrada del héroe apagada, marcador sin
interpolación, borde de tarjeta sin transición, cambio de idioma sin fundido,
y el chunk 3D ni se pide (7 chunks en vez de 8, medido).

## Correr en local

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm run build          # estático, ambos idiomas
npm run lint           # eslint + tokens vivos y coincidentes + prosa anclada a perfil.yaml
npm run sync:perfil    # re-sincroniza perfil.yaml al SHA fijado en evidence.ts
npm run a11y           # axe-core contra http://localhost:3100 (A11Y_URL para otro origen);
                       # necesita `npx playwright install chromium` o CHROME_PATH
```

### Subir a un commit nuevo del agente

1. Cambia `CV_AGENT_SHA` en `src/lib/evidence.ts`.
2. `npm run sync:perfil`
3. **Revisa los números de línea de `CITES`.** Están fijados a ese SHA, y
   cualquier línea añadida al YAML desplaza todas las de abajo. No es opcional:
   una cita desfasada apunta a una afirmación que no es la que dice.

---

## Banderas pendientes

Queda una. `PORTRAIT_URL` se eliminó del código —no va a haber foto, y una
bandera muerta es deuda—, así que el héroe ya no tiene hueco reservado ni
condicional que mantener.

| Bandera | Para encenderla |
|---|---|
| `RESUME_URL` | Sube el PDF a `public/` y pon su ruta en `src/lib/site.ts`. Aparece el botón de descarga en el héroe, en contacto y en el nav. |
| `AGENT_URL` | Se puede sobreescribir con `NEXT_PUBLIC_AGENT_URL`. Es pública por definición: nunca pongas aquí la llave del endpoint Bearer. |

---

## Privacidad

Sin teléfono y sin dirección. No es una omisión: `perfil.yaml` los declara como
datos no divulgables, y el sitio respeta la misma regla que el agente.
