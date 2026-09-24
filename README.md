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
    [lang]/                  layout raíz (pone el modo, el umbral y el nivel antes de pintar), imagen OG
      page.tsx               el mapa (o el umbral, la primera vez)   /en, /es
      cv/page.tsx            el Modo CV con URL propia               /es/cv, /en/cv
      [node]/page.tsx        un nodo                                 /es/memoria, /en/memory…
      [node]/[sub]/page.tsx  un subnodo                              /es/memoria/agentes-en-produccion
    sitemap.ts               sólo los idiomas terminados; cada nodo y subnodo
    robots.ts                los pendientes van a Disallow
    globals.css              tokens (@theme), clases de componente, los dos modos, reduced-motion
  components/
    Site.tsx                 la página entera, para cualquier ruta
    threshold/               el umbral: Threshold (las dos opciones y los marcos), ThresholdClient (eventos)
    Core.tsx                 el núcleo: la primera pantalla
    map/                     el marco: Explorer (almacén), MapStage + MapScene (WebGL), MapDiagram (SVG),
                             MapLabels, RouteBar, Room, RoomClose
    rooms/                   WhoIAm, Training, Hood, DaltonMoment
    Experience, Projects, Skills, Contact   el cuerpo de las salas
    Nav, ModeSwitch (CV | Explorar), LanguageLink
    AgentChat, AgentDemo     ← escritos, SIN publicar
  content/
    perfil.json              GENERADO — no editar a mano
    perfil.ts                acceso tipado + formateo de fechas
    runs/es.json             la corrida grabada del agente, por idioma (ver "Bajo el capó")
    runs/en.json
    runs.ts                  acceso tipado a las corridas
    dictionary.ts            la forma del contenido
    en.ts                    prosa en inglés  (completo)
    es.ts                    prosa en español (completo)
  lib/
    evidence.ts              SHA fijado + todas las citas, en un solo lugar
    map-graph.ts             el mapa: nodos, slugs, aristas, tour, cámara
    explorer.ts              el explorador: umbral y caída, niveles, URLs, tour, teclado, modo
    tokens.ts                las curvas y el vuelo, en JS, iguales que en el CSS
    bezier.ts                cubic-bezier() como función, 40 líneas
    site.ts                  dominio, endpoint del agente, idiomas, banderas
scripts/
  sync-perfil.mjs            trae perfil.yaml del repo del agente
  check-tokens.mjs           lint: las curvas y el vuelo del JS son los del CSS y ningún token está muerto
  check-claims.mjs           lint: cada número y nombre propio de la prosa está en perfil.yaml
  check-runs.mjs             lint: las corridas grabadas tienen forma completa y son del agente desplegado
  a11y.mjs                   axe-core contra la página construida, 2 idiomas × 10 estados
docs/
  agent-run-map.md           lo que pasa de verdad en una corrida, con archivo:línea
tests/
  agent-demo/                pruebas del cliente del agente, con su README
```

---

## El perfil como un agente que se explora con zoom

Mi CV vive en los nodos de un mapa; la mecánica de agentes vive en el marco.
Tres principios mandan sobre todo lo demás:

1. **Las dos historias van separadas.** Las salas son CV puro: ni una línea
   sobre agentes. El vocabulario de agente aparece sólo en el marco —el nombre
   de cada nodo (término de agente en inglés + término normal traducido:
   "Memory · Experiencia") y la ruta— y la explicación de cómo funciona la
   página vive en un nodo propio, "Bajo el capó", que cuelga del núcleo con
   una arista punteada porque no es parte del CV.
2. **Navegación espacial con zoom semántico en tres niveles:** mapa, nodo (una
   sección) y subnodo (el detalle: un puesto). Entrar a un nodo es un vuelo de
   cámara de 900 ms; el nodo se abre como una sala y el resto del grafo se
   desenfoca y oscurece detrás. Cada nivel tiene su URL (`/es/memoria/dalton`),
   así que el atrás del navegador y los enlaces directos funcionan; la ruta
   tipo terminal (`~/alex/memoria/dalton`) lleva un enlace por tramo.
3. **Dos formas de recorrerlo.** El scroll es un tour guiado que vuela de
   nodo en nodo en orden; el clic o el toque es exploración libre. "Modo CV",
   siempre en la barra, muestra todo el contenido en una sola columna sencilla
   e imprimible: es también lo que se ve sin JavaScript o sin WebGL, y lo que
   lee un buscador.

### El umbral: la entrada donde se elige cómo conocerme

En la primera visita, antes de todo, la pantalla se divide en dos y cada
mitad es una previsualización viva de su modo dentro de un marco con
profundidad: a la izquierda el Modo CV —la columna real (`main.page`) a
escala, con un desplazamiento lento que se detiene al pasar el cursor—, y a
la derecha el mapa real (`.stage`), el mismo lienzo que después ocupa la
pantalla completa, orbitando despacio; mientras el 3D carga se ve el SVG.
Nada es una captura y nada se vuelve a cargar al elegir. Encima de cada
marco va la opción, en grande: "Respuesta rápida · Leer el CV" y
"Razonamiento profundo · Explorar", sin tiempo. Hubo una versión con los
minutos calculados sobre el texto real (el CV entero, doce; el tour, dos) y
se quitó porque se contradecía sola: la "respuesta rápida" tardaba seis
veces más que el "razonamiento profundo". El nombre accesible de cada botón
es su texto.

Al pasar el cursor, esa mitad crece a cerca del 60 % del ancho y se inclina
hacia la persona con el marco en acento; la otra se atenúa y se aleja. Al
elegir, la previsualización se vuelve un portal que crece hacia la pantalla
desde el punto exacto del clic (el punto de fuga), el marco se disuelve al
rebasar los bordes y la otra mitad cae hacia atrás. Elegir el CV aterriza
arriba de la columna con un rebote suave de resorte; elegir explorar sigue
dentro del 3D: la cámara cae a través del grafo con los nodos pasando de
largo y las partículas en estela, desacelera y se asienta en el mapa con el
héroe. Todo dura 1.25 s (`--duration-fall`), sólo transform y opacidad en el
HTML (Web Animations), sin saltos de layout. En móvil la división es
vertical y se elige tocando.

Reglas: sale sólo la primera vez, la elección se guarda en el navegador y
después el sitio abre en el último modo elegido; un enlace directo a un nodo
se lo salta; `/es/cv` y `/en/cv` abren en Modo CV. Todo eso lo decide un
script en línea en `<head>` antes del primer pintado, sin destello. Las
previsualizaciones van `inert` y son decorativas para lectores de pantalla;
los dos botones son reales, con el tiempo en su nombre accesible, y las
flechas cambian de opción. Sin JavaScript se ve el CV directamente; con
movimiento reducido no hay caída, sólo un fundido de 200 ms. El LCP sigue
siendo texto del servidor: la explicación del umbral.

**El interruptor** "CV | Explorar", segmentado y con el modo activo en acento,
va siempre en la barra y en móvil, además, fijo abajo. Cambiar de modo usa la
misma caída, en corto (`--duration-fall-short`, 550 ms).

### El nodo se convierte en la sala

Nada aparece de la nada; cada cosa sale de otra. Entrar a un nodo tiene
coreografía: una anticipación de 80 ms (el nodo se ilumina y la cámara
retrocede un poco), un vuelo en curva —no en línea recta— con un leve
cierre del campo de visión al llegar, el anillo del nodo que se abre como
diafragma hasta ser el marco de la sala, las partículas que fluyen hacia el
nodo como tokens que entran, y el resto del grafo que se aleja con desenfoque
progresivo (en móvil, atenuación y escala). La etiqueta del nodo viaja desde
el mapa hasta convertirse en el nombre de la sala (un fantasma animado con
Web Animations, sincronizado con la cámara), y el contenido entra en cascada
con 50 ms entre nombre, título, entrada y cuerpo: todo legible antes de
700 ms desde el clic (`--duration-flight`, 650 ms). La salida es el reverso,
al 65 %: el contenido se recoge hacia el nodo y la cámara se retira.

La cámara es un resorte críticamente amortiguado y se puede reorientar a
medio vuelo: si se elige otro nodo en pleno vuelo, cambia de destino sin
cortes. Del nodo al subnodo no hay vuelo: la sala se desplaza de lado, como
avanzar por una línea de tiempo. El tour por scroll arrastra el objetivo del
resorte por una trayectoria continua (Catmull-Rom por todas las paradas) con
asentamiento suave en cada una; la persona manda la velocidad y nada
secuestra el scroll. El scroll usa `replaceState`; sólo entrar con clic,
toque o Enter usa `pushState`.

| Nodo | Sala | Contenido |
|---|---|---|
| Alex | El núcleo | La primera pantalla: nombre, rol, las tres cifras con fuente y contacto, encima del mapa completo, y la pista "Haz scroll o toca un nodo". |
| System prompt · Quién soy | `/es/quien-soy` | Quién soy y qué busco, en una sola columna, y debajo, a todo el ancho, "Cómo trabajo": cuatro principios en una rejilla de 2 × 2 (una columna en móvil), cada uno con su frase, su línea de prueba y la cita a `principios` en perfil.yaml. |
| Memory · Experiencia | `/es/memoria` | Los cuatro puestos como subnodos, del más reciente al más antiguo, con slugs por función (`/es/memoria/agentes-en-produccion`), nunca con ids del YAML. Dentro del primero, el momento fuerte: un grafo de más de 180 nodos que colapsa en un solo orquestador con cuatro ramas, y el 92 %. La ficha de cada puesto (fechas, lugar, empresa, puesto) va en dos líneas encima del titular, no en una columna al lado. |
| Outputs · Proyectos | `/es/proyectos` | Los siete proyectos de perfil.yaml. |
| Tools · Stack | `/es/stack` | Las nueve categorías de habilidades, una debajo de otra: en rejilla las cortas dejaban hueco al lado de las largas. |
| Training · Formación | `/es/formacion` | IPN, la publicación arbitrada con sus límites, idiomas y certificaciones en curso, en una sola columna; las certificaciones en una fila de tarjetas de la misma altura. |
| API · Contacto | `/es/contacto` | Correo, LinkedIn y GitHub. |
| Bajo el capó | `/es/bajo-el-capo` | Cómo funciona la página: la ventana de contexto bloque por bloque y la corrida grabada con su marcador. Las grabaciones sólo se usan aquí. Ventana de contexto y marcador van en una sola columna. **Oculto mientras las corridas estén `pending`**: `next.config.ts` lee `src/content/runs/*.json` al construir y fija `NEXT_PUBLIC_HOOD_AVAILABLE`; sin ella el nodo sale del grafo entero (mapa, aristas, tour, etiquetas, barra, sala y sitemap) y `/es/bajo-el-capo` y `/en/under-the-hood` redirigen al mapa. Vuelve solo en cuanto las dos grabaciones existan y pasen `check-runs`. |

**Es verdad, no una simulación.** Lo que "Bajo el capó" reproduce es una
corrida grabada contra el agente desplegado (`scripts/grabar_corrida.py` en
el repo del agente): eventos SSE con tiempo, id, `usage`, herramientas y el
contexto bloque por bloque, contado con el tokenizador sobre el texto exacto.
Nada corre en vivo, cada visita cuesta cero, y cada número sale de ese JSON.
Mientras `runs/*.json` está `pending`, el marcador lo dice y no hay cifras.
`docs/agent-run-map.md` tiene lo que pasa de verdad en el agente, con
archivo y línea.

**Un solo DOM para los dos modos.** El HTML del servidor es siempre la
columna completa: el núcleo y las siete salas, una tras otra. Con JavaScript,
un script en `<head>` pone `data-mode="explore"` antes del primer pintado
(salvo que la persona haya elegido Modo CV, que se recuerda en el navegador)
y el CSS convierte esa misma columna en el mapa: el núcleo queda fijo sobre el
lienzo, las salas se esconden salvo la abierta, que se vuelve panel con scroll
propio, y un carril invisible le da al scroll la altura del tour. Nada se
duplica y nada se pide al servidor al navegar: cada nodo es un `pushState`
sobre la misma página. Un enlace directo a un subnodo llega con su sala ya
abierta en el HTML.

**El escenario** es un solo lienzo fijo detrás de todo (three.js con React
Three Fiber, `src/components/map/MapScene.tsx`): el grafo con el núcleo al
centro y los nodos a distintas profundidades, compuesto a mano para apaisado
y para vertical (`src/lib/map-graph.ts`). Los nodos son esferas de vidrio
—un sombreado propio con borde fresnel en acento y brillo interior— que se
encienden al pasar el cursor por la esfera o por la etiqueta, y con ellas se
encienden sus aristas, tramo por tramo, nunca bajo texto. El núcleo lleva un
halo suave detrás del bloque del héroe: es el origen del que salen las
aristas. Las aristas significan algo —el system prompt gobierna a todos,
Tools alimenta a Outputs, Training alimenta a Memory— y por ellas viajan
partículas redondas y suaves, con mezcla aditiva y una estela corta, como
tokens. En reposo, paralaje suave con el cursor. `frameloop="demand"`:
renderiza mientras hay algo que mover —el umbral, una caída, un resorte sin
asentar, el paralaje y las partículas mientras el mapa está a la vista— y
con la pestaña oculta o con movimiento reducido no pide ningún cuadro. DPR
tope 2 (1.5 en vertical), sin luces ni posprocesado. Se carga después del
LCP en su propio chunk (**243 KB gzip**, 242 795 B; tope 300); mientras tanto está el
mismo mapa como SVG del servidor, proyectado con la misma cámara. Sin WebGL
la página pasa a Modo CV, y en Modo CV el lienzo se desmonta: nunca hay dos
contextos WebGL, y a veces ninguno.

**Etiquetas, teclado y lectores de pantalla.** Las etiquetas de los nodos son
HTML encima del lienzo (enlaces de verdad, con su URL y objetivos táctiles
de 44 px), colocadas cada cuadro con la proyección de la cámara. Se recorren
con las flechas, Enter entra y Esc sale (o el atrás del navegador, o
pellizcar en el teléfono). La sala abierta es un `role="dialog"`, recibe el
foco en su título, y lo que queda detrás (núcleo y etiquetas) va `inert`; al
salir, el foco vuelve a la etiqueta del nodo. En móvil la sala entra como
panel a pantalla completa.

**Movimiento con significado.** Lo único que se mueve es lo que cambia de
estado: el vuelo de la cámara al entrar y salir, la sala que llega cuando la
cámara aterriza, las barras de la ventana de contexto que se llenan al abrir
"Bajo el capó", y el colapso del grafo de Dalton cuando su subnodo entra en
pantalla. Con `prefers-reduced-motion` la cámara salta y la sala llega con un
fundido de opacidad, que es lo único que se conserva.

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

## Composición y tipografía

Dos reglas para todo el sitio, Modo CV y salas por igual:

- **Ninguna columna deja un hueco al lado de la otra.** Si dos bloques no
  quedan parejos, van en una sola columna. Por eso "Quién soy" es una
  columna arriba (presentación y qué busco) y una rejilla de 2 × 2 abajo,
  y por eso las rejillas de tarjetas estiran cada fila. Se revisa con
  capturas de cada sección a 1280, 1440 y 1920 px y a 390 px.
- **Sin guion largo en el texto del sitio.** Donde había uno va dos puntos,
  coma o punto; los rangos de fechas llevan semirraya ("2021 – 2025"). Los
  dos títulos que venían del YAML con guion largo (el titular y el puesto de
  investigador) cambiaron en perfil.yaml, que es de donde sale el texto.

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

Hay un solo momento orquestado al cargar —la entrada del núcleo— y lo demás
responde a lo que hace la persona: el vuelo de la cámara, la sala que se abre,
el colapso del grafo de Dalton. No hay entradas por scroll ni tarjetas que se
eleven: cada bloque renderiza visible por defecto, sin ningún estado inicial
que dependa de JavaScript para resolverse, y no hay librería de animación.

Los tokens de movimiento viven en el `@theme` de `globals.css` y son sólo los
que algo usa: `duration-fast` (150 ms: hover, foco, estado), `duration-base`
(300 ms: la entrada del núcleo, el borde de una tarjeta, el cambio de idioma,
la llegada de una sala), `duration-flight` (650 ms: la entrada a un nodo y
el colapso del grafo de Dalton), `duration-fall` (1.25 s: la caída del
umbral), `duration-fall-short` (550 ms: la misma caída desde el
interruptor), `ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, `ease-in-out`
`cubic-bezier(0.65, 0, 0.35, 1)` y `distance` (16 px; tope 20). `npm run
lint` falla si un token se queda sin uso, y comprueba que las curvas y las
duraciones que usa el JS (`src/lib/tokens.ts`) sean las mismas que en el CSS.

**Regla dura:** todo lo que se mueve anima sólo `transform` y `opacity`. Los
hovers cambian color, que no dispara layout. Se puede comprobar en el CSS
compilado: un solo `@keyframes`, y ninguna `transition` fuera de color,
opacidad y transform.

| Qué | Cómo |
|---|---|
| Entrada del núcleo | Una animación CSS: fade + 16 px, 300 ms, ease-out, en cuatro tandas a 60 ms (nombre, titular, cifras, contacto). Corre sin JS y arranca en el primer pintado, así que no retrasa el LCP. Sólo en la primera carga: al cambiar de idioma `<html>` lleva `data-navigated` y el núcleo nuevo llega con el fundido. |
| Vuelo de la cámara | Lo que anima desde JavaScript: un resorte críticamente amortiguado sobre posición, objetivo y campo de visión, reorientable a medio vuelo, con anticipación de 80 ms y vuelo en curva. La sala llega en cascada cuando la cámara ya casi aterrizó (`duration-flight`), y la etiqueta del nodo viaja hasta el nombre de la sala con Web Animations. |
| La caída del umbral | Web Animations sobre transform y opacidad: la previsualización elegida crece hacia la pantalla desde el punto del clic (con rebote de resorte para el CV) y la otra cae hacia atrás; en el 3D, la cámara atraviesa el grafo con impulso y se asienta. `duration-fall` (1.25 s); desde el interruptor, `duration-fall-short` (550 ms). |
| El grafo de Dalton | Más de 180 círculos en un SVG con sus dos posiciones en variables CSS; al cambiar `data-state` el CSS interpola `transform` en 650 ms con 2 ms de escalonado. Sin JavaScript se ve el estado final. |
| Hovers | Tarjetas: el borde pasa del gris fino al acento en 300 ms, sólo color. Enlaces del nav: un subrayado que crece desde la izquierda, que es un `scaleX` sobre un pseudoelemento. Botones: fondo, 150 ms. Las utilidades `transition-*` de Tailwind heredan los tokens de estado. |
| Cambio de idioma | Fundido cruzado con la View Transitions API a `duration-base`, disparado por `LanguageLink`: sin recarga, sin blanco en medio. La posición de lectura se conserva a propósito (`scroll: false` en las dos rutas): las dos páginas tienen la misma estructura, y el mismo desplazamiento muestra la misma sección en el otro idioma. Sin la API, el enlace navega como siempre. |
| El mapa en reposo | Partículas por las aristas y paralaje con el cursor, en el bucle bajo demanda: 20 cuadros por segundo mientras hay vida, ninguno cuando no. Detalle arriba, en "El perfil como un agente". |

Con `prefers-reduced-motion: reduce` las animaciones se quitan —no se acortan—:
el núcleo aparece entero, la cámara salta en vez de volar, la sala llega con
un fundido de opacidad (lo único que se conserva), el grafo de Dalton se queda
en su estado final, las partículas no viajan, y el fundido entre idiomas se
salta entero.

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

**Con el mapa** (Fase 1 bis), mismo contenedor, 3 corridas por ruta:

| Ruta | Rendimiento | LCP | TBT | CLS |
|---|---|---|---|---|
| `/en` | 99 / 99 / 98 | 2.17 / 2.18 / 2.11 s | 64 ms | 0.001 |
| `/es` | 99 / 100 / 100 | 2.15 / 1.87 / 1.85 s | 49 ms | 0.000 |

El elemento LCP es el titular (`h1`, 380 × 106 px en móvil), que entra con
desplazamiento pero sin fundido: Chrome no cuenta como LCP un elemento en
opacidad 0, y el fundido lo retrasaba 100 ms observados. El nivel del mapa lo
pone el script de `<head>` antes de pintar por lo mismo: si el CSS esperara a
la hidratación para saber que no hay sala abierta, escondería el núcleo
durante 200 ms. Accesibilidad, buenas prácticas y SEO: 100 en las seis.

**Con el umbral** (primera visita), mismo contenedor, 3 corridas por ruta.
Lighthouse corre sin WebGL, así que ve lo que ve un navegador sin WebGL: el
script de `<head>` lo detecta antes de pintar y abre en Modo CV, sin destello
ni salto de layout.

| Ruta | Rendimiento | LCP | TBT | CLS | Accesibilidad |
|---|---|---|---|---|---|
| `/en` | 99 (99 / 99 / 99) | 2.17 s | 40 ms | 0.000 | 100 |
| `/es` | 99 (97 / 100 / 99) | 2.16 s | 33 ms | 0.000 | 100 |
| `/en/cv` | 100 (99 / 100 / 100) | 1.87 s | 35 ms | 0.000 | 100 |

El elemento LCP es el titular (`h1`) en las tres rutas: como Lighthouse no
tiene WebGL, `/en` y `/es` abren en Modo CV y el titular es lo más grande
que pinta el servidor. El LCP de este contenedor sigue siendo bimodal (1.9 o
2.2 s según la corrida, con alguna a 2.6): `/en` 2.18 / 2.15 / 2.17 s, `/es`
2.57 / 1.85 / 2.16 s, `/en/cv` 2.15 / 1.87 / 1.86 s; FCP 0.91 s en las tres
y ningún cambio de layout (0 layout shifts en las nueve corridas).

**Cuadros perdidos**, con traza de Chrome (`Tracing` por CDP, eventos
`PipelineReporter`) y con `requestAnimationFrame` (un intervalo mayor de
25 ms es un cuadro perdido), sin limitar la CPU y con limitación 4x
(`Emulation.setCPUThrottlingRate`). Este contenedor no tiene GPU: el WebGL
corre en SwiftShader, por software, y la traza lo dice —más del 85 % de
cada ventana se va en `Graphics.Pipeline`, con estilo y layout en 30–70 ms—,
así que son cotas inferiores, no lo que verá una máquina con GPU:

| Momento | CPU 1x | CPU 4x |
|---|---|---|
| Caída del umbral → explorar (1.4 s) | 37 cuadros rAF, peor intervalo 71 ms; traza: 51 perdidos de 129 | 33 cuadros, peor 158 ms; 53 de 119 |
| Entrada a un nodo (0.8 s) | 15 cuadros, peor 188 ms; 44 de 86 | 11 cuadros, peor 229 ms; 43 de 80 |
| Salida (0.7 s) | 8 cuadros, peor 135 ms; 66 de 87 | 6 cuadros, peor 178 ms; 48 de 67 |

JS servido en `/en`, gzip, medido chunk por chunk contra `next start`:

| | JS servido (gzip) |
|---|---|
| Con `motion` (entradas por scroll, elevación de tarjetas) | 207 130 B |
| Sin librería: héroe en CSS, contador con `requestAnimationFrame` | **172 733 B** |
| Corrida del agente: héroe, marcador y escenario; el chunk 3D (237 786 B) va aparte y se pide después del LCP | **175 450 B** + 237 786 B diferidos |
| El mapa: núcleo, explorador, etiquetas y ruta; el chunk 3D (240 628 B, tope 300 KB) va aparte, se pide después del LCP y sólo en modo explorar | **179 109 B** + 240 628 B diferidos |
| Con el umbral y el interruptor; el chunk 3D (242 795 B, tope 300 KB) suma el vidrio, las partículas con estela y el resorte | **181 868 B** + 242 795 B diferidos |

**34 397 bytes gzip menos.** `motion` no aparece en `package.json`, en ningún
import ni en el bundle compilado; la única palabra "motion" que queda es
`prefers-reduced-motion`.

Accesibilidad, con herramientas y no con impresión:

- **Lighthouse, pestaña Accessibility: 100** en `/en` y `/es` (Lighthouse
  13.5, axe 4.13): 25 auditorías pasan, 0 fallan, 10 son manuales, 40 no
  aplican. `color-contrast` pasa con 0 elementos señalados.
- **axe-core 4.13 desde el proyecto** (`npm run a11y`): 0 violaciones WCAG 2.x
  A/AA y 0 de best-practice en 20 estados (2 idiomas × móvil, menú abierto,
  umbral en escritorio y en móvil, mapa, sala abierta, subnodo, sala en
  móvil, Modo CV, movimiento reducido); 29 reglas pasan. En el umbral
  la columna va `inert`, así que el umbral es el `main` y el nombre es el
  `h1`; el interruptor fijo de móvil va en su propio landmark. La única regla "por revisar" es `color-contrast` sobre lo
  que está encima del lienzo, porque axe no mide contra un fondo que no es un
  color plano. Eso se mide aparte, abajo. La primera pasada encontró un
  fallo real de `target-size` en los tramos de la ruta (`~` medía 10 px);
  ahora cada tramo es un objetivo de 24 × 24 px.
- **Teclado, con Tab de verdad:** el skip link, el logotipo, los siete nodos
  del nav, Modo CV, el idioma, la ruta y las siete etiquetas del mapa, todas
  con anillo de foco y en el orden del tour; las flechas saltan entre
  etiquetas, Enter entra y deja el foco en el título de la sala, Esc sale y
  devuelve el foco a la etiqueta del nodo. Con una sala abierta, el núcleo y
  las etiquetas van `inert`: Tab no cae en lo que está desenfocado detrás.
- **Contraste del texto, medido en píxeles renderizados con el mapa
  corriendo.** AA pide 4.5:1; AAA, 7:1; `muted` da 7.72:1 contra el fondo
  plano. El mapa es una dependencia de contraste, con presupuesto: el cuerpo
  de texto (`muted`) tiene que quedar en AAA sobre lo que sea que el grafo
  pinte detrás, y eso fija el píxel más claro permitido bajo un bloque de
  texto: luminancia relativa 0.0085, que es rgb(22, 22, 22) en gris o
  rgb(14, 20, 38) en el azul del mapa. El escenario lo cumple por construcción —cada
  nodo, anillo y partícula se proyecta a pantalla y, si cae bajo el texto del
  héroe, bajo el panel de una sala o bajo una etiqueta, pinta por debajo del
  tope; las aristas van pre-mezcladas con el fondo y siempre por debajo— y se
  mide con el lienzo corriendo: se esconde el texto y se toma el píxel más
  claro bajo el héroe (con las partículas viajando), bajo las siete
  etiquetas, bajo el panel de tres salas y bajo el texto del umbral, en
  escritorio y a 390 px. Hoy: **7.09:1** en escritorio y **7.12:1** en
  móvil para `muted` (peor caso), `subtle` 5.38:1, `accent` 4.94:1. Cada
  cambio de la escena volvió a medirse: la arista punteada al núcleo salía a
  rgb(28, 28, 29) y bajó al 7.5 %; las partículas aditivas con estela
  primero se atenuaban bajo texto y aun así, sumadas a la arista atenuada y
  entre sí, salían a rgb(28, 33, 54): ahora se apagan del todo al llegar al
  texto, con una banda suave de 28 px (20 en vertical) antes del borde y el
  radio de su sprite como margen; y las etiquetas se esconden mientras hay
  una sala abierta (a 390 px no hay desenfoque y una etiqueta bajo el velo
  daba rgb(28, 28, 28)). Si cambian los colores del mapa, se vuelve a medir.

Sin JavaScript: la columna completa (Modo CV), sin lienzo ni botón de modo;
de los 395 nodos de texto de `<main>`, **0 ocultos** en los dos idiomas, y
nada en opacidad 0 en reposo. Con JavaScript, navegar entre nodos no pide
nada al servidor (0 peticiones RSC al entrar a un nodo, medido), el atrás del
navegador deshace cada nivel y el tour por scroll deja su rastro en la URL.
Con `prefers-reduced-motion: reduce` el 3D sí carga: la cámara salta, la sala
llega con su fundido y las partículas se quedan quietas.

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
| `NEXT_PUBLIC_HOOD_AVAILABLE` | No se pone a mano: la calcula `next.config.ts` con el `status` de las dos corridas. Graba las corridas con `scripts/grabar_corrida.py` de cv-agent, pasa `npm run lint` (check-runs) y el nodo "Bajo el capó" vuelve con el siguiente build. |

---

## Privacidad

Sin teléfono y sin dirección. No es una omisión: `perfil.yaml` los declara como
datos no divulgables, y el sitio respeta la misma regla que el agente.
