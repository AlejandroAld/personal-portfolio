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
  components/          secciones + tres islas de cliente:
                         Nav, LanguageLink, Counter, HeroBackdrop
                         AgentChat, AgentDemo  ← escritos, SIN publicar
  content/
    perfil.json        GENERADO — no editar a mano
    perfil.ts          acceso tipado + formateo de fechas
    dictionary.ts      la forma del contenido
    en.ts              prosa en inglés  (completo)
    es.ts              prosa en español (completo)
  lib/
    evidence.ts        SHA fijado + todas las citas, en un solo lugar
    glow.ts            el shader del héroe, en chunk aparte
    tokens.ts          la curva de entrada, en JS, para el contador
    bezier.ts          cubic-bezier() como función, 40 líneas
    site.ts            dominio, endpoint del agente, idiomas, banderas
scripts/
  sync-perfil.mjs      trae perfil.yaml del repo del agente
  check-tokens.mjs     lint: la curva del JS es la del CSS y ningún token está muerto
  check-claims.mjs     lint: cada número y nombre propio de la prosa está en perfil.yaml
  a11y.mjs             axe-core contra la página construida, 2 idiomas × 4 estados
tests/
  agent-demo/          pruebas del cliente del agente, con su README
```

---

## Arquitectura de información

El orden es el de un portafolio, no el de un proyecto:

1. **Héroe** — una frase de posicionamiento y dos salidas: contacto y trabajo.
2. **Métricas** — tres datos del rol actual, los tres en el YAML. El tercero
   va sin cifra a propósito: el alcance del bot interno se declara como
   "miles, alcance nacional" por confidencialidad, y fabricar un número para
   que la tira quede simétrica sería justo lo que el resto de la página
   promete no hacer.
3. **Experiencia** — los cuatro puestos. Cada uno titulado con su RESULTADO
   cuando el perfil lo cuantifica; Grupo TI México no tiene métrica en el
   YAML, así que se titula por lo que resolvió.
4. **Proyectos** — los siete, en grid, con badges de tecnología y enlaces.
5. **Publicación** — sección propia, con sus números y las limitaciones.
6. **Habilidades** — las nueve categorías de perfil.yaml.
7. **Credenciales** — estudios y certificaciones.
8. **Cómo pienso** — tres modos de falla: uno de investigación, uno de
   producción, uno del agente.
9. **Contacto**.

### El agente de CV es una tarjeta

Destaca —ocupa dos columnas y lleva sus viñetas— pero es una entre siete. El
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

La página no lleva una cita bajo cada bloque: eso era ruido. El pie lo explica
una vez, con enlace al YAML. Para comprobar un número concreto, cada bloque con
métrica tiene un enlace a su línea exacta que aparece al pasar el cursor o al
llegar con el teclado, y que en reposo no ocupa espacio.

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

Dos excepciones, documentadas donde viven: el color del degradado del héroe
está calculado contra el shader en `src/lib/glow.ts`, y la imagen OG repite
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
| Entrada del héroe | Una animación CSS: fade + 16 px, 300 ms, ease-out; párrafo, disponibilidad y botones a 60 ms cada uno (el último arranca a 180 ms). Corre sin JS y arranca en el primer pintado, así que no retrasa el LCP. Sólo en la primera carga: al cambiar de idioma `<html>` lleva `data-navigated` y el héroe nuevo llega con el fundido. |
| Contadores | Lo único que anima desde JavaScript: el valor final se renderiza en el servidor —existe sin JS y lo indexa un buscador— y un `requestAnimationFrame` cuenta desde cero en 800 ms con la curva de entrada cuando el 30 % de la cifra entra en pantalla, una vez. La curva es `cubic-bezier()` resuelta en 40 líneas propias (`src/lib/bezier.ts`); medida contra la implementación de la librería que se quitó, difiere en menos de 0.001 y da los mismos enteros en los mismos instantes. |
| Hovers | Tarjetas: el borde pasa del gris fino al acento en 300 ms, sólo color. Enlaces del nav: un subrayado que crece desde la izquierda, que es un `scaleX` sobre un pseudoelemento. Botones: fondo, 150 ms. Las utilidades `transition-*` de Tailwind heredan los tokens de estado. |
| Cambio de idioma | Fundido cruzado con la View Transitions API a `duration-base`, disparado por `LanguageLink`: sin recarga, sin blanco en medio. La posición de lectura se conserva a propósito (`scroll: false` en las dos rutas): las dos páginas tienen la misma estructura, y el mismo desplazamiento muestra la misma sección en el otro idioma. Sin la API, el enlace navega como siempre. |
| Fondo del héroe | Un shader de fragmento en WebGL crudo, sin three.js. Ver abajo. |

Con `prefers-reduced-motion: reduce` las animaciones se quitan —no se acortan—:
el héroe aparece entero, el contador se queda en su cifra, el borde de la
tarjeta cambia de golpe, y el fundido entre idiomas se salta entero.

### El fondo del héroe

Un triángulo a pantalla completa y un shader de ruido que se mueve muy despacio.
**2 235 bytes gzip**, de los cuales 1 950 son un chunk aparte que no está en el
HTML inicial.

Fuera de la ruta crítica: la importación arranca en `requestIdleCallback`.

Se cae al degradado CSS —que está siempre debajo y es una composición
terminada, no un hueco— si no hay WebGL, si se pierde el contexto, con
`prefers-reduced-motion`, o con `hardwareConcurrency <= 2`. En esos casos **no
se descargan los bytes**.

El corte de verdad no lo pone el número de núcleos, que es un proxy pobre, sino
una **medición real**: tras cinco vueltas de calentamiento se miden treinta, y
si no llegan a 24 fps el shader se apaga solo y se queda el degradado.

El bucle se detiene con la pestaña oculta y con el canvas fuera del viewport.
El canvas va con `aria-hidden` y no toca el árbol de accesibilidad.

El tope de brillo del shader no es una decisión estética, es de contraste: el
color más claro que puede producir está calculado para que todo color de texto
de la página siga pasando AA encima de él. Los números están en
`src/lib/glow.ts`; si se sube el tinte, hay que recalcularlos.

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

JS servido en `/en`, gzip, medido chunk por chunk contra `next start`:

| | JS servido (gzip) |
|---|---|
| Con `motion` (entradas por scroll, elevación de tarjetas) | 207 130 B |
| Sin librería: héroe en CSS, contador con `requestAnimationFrame` | **172 733 B** |

**34 397 bytes gzip menos.** `motion` no aparece en `package.json`, en ningún
import ni en el bundle compilado; la única palabra "motion" que queda es
`prefers-reduced-motion`.

Accesibilidad, con herramientas y no con impresión:

- **Lighthouse, pestaña Accessibility: 100** en `/en` y `/es` (Lighthouse
  13.5, axe 4.13): 24 auditorías pasan, 0 fallan, 10 son manuales, 41 no
  aplican. `color-contrast` pasa con 0 elementos señalados.
- **axe-core 4.13 desde el proyecto** (`npm run a11y`): 0 violaciones WCAG 2.x
  A/AA y 0 de best-practice en 8 estados (2 idiomas × móvil, menú abierto,
  hover de tarjeta, movimiento reducido); 25 reglas pasan. La única regla "por
  revisar" es `color-contrast` sobre los nodos que están encima del canvas del
  héroe, porque axe no mide contra un fondo que no es un color plano. Esos se
  miden aparte, abajo.
- **Teclado, con Tab de verdad:** 26 paradas por idioma, las 26 con anillo de
  foco y opacidad ≥ 0.9, orden vertical monótono (el DOM es el orden visual),
  Shift+Tab lo recorre al revés, sin trampas de foco. El skip link es la
  primera parada y lleva a `#main`; el menú móvil abre con Enter y cierra con
  Esc sin soltar el foco.
- **Contraste del texto del héroe, medido en píxeles renderizados** con el
  shader corriendo (se oculta el texto y se lee el fondo bajo su caja, y se
  toma el píxel más claro): párrafo `muted` **7.41:1** en escritorio y
  **7.42:1** en móvil (7.72:1 contra el fondo plano; 6.65:1 contra el color
  más claro que el shader puede producir); línea de disponibilidad `subtle`
  5.63:1; eyebrow `accent` 5.32:1. AA pide 4.5:1; AAA, 7:1.

  **La paleta del shader es una dependencia de contraste.** Ese 7.41:1 está
  medido contra el píxel más claro que el shader produce hoy, y el tope de
  brillo está calculado en `src/lib/glow.ts` para que todo texto del héroe
  siga en AA encima. Si cambia el tinte, la intensidad o la posición de la
  fuente de luz, hay que volver a medir: no lo cubre ningún script, es una
  captura con el shader corriendo.

Sin JavaScript: de los 334 nodos de texto de `<main>`, **0 ocultos** en los
dos idiomas; lo único con opacidad 0 en reposo son los nueve enlaces de fuente,
que aparecen al pasar el cursor o al enfocarlos también sin JS. Con
`prefers-reduced-motion: reduce`: entrada del héroe apagada, contadores quietos,
borde de tarjeta sin transición, cambio de idioma sin fundido, y el chunk del
shader ni se pide.

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
