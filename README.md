# Portafolio — José Alejandro Aldama Ramos

Sitio personal de AI Engineer. Next.js 16 (App Router), TypeScript estricto,
Tailwind v4. Bilingüe, estático, sin librerías de animación.

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
    globals.css        tokens, evidencia, revelado, reduced-motion
  components/          secciones + islas de cliente:
                         Nav, Counter, Reveal, HeroBackdrop
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
    site.ts            dominio, endpoint del agente, idiomas, banderas
scripts/
  sync-perfil.mjs      trae perfil.yaml del repo del agente
tests/
  agent-demo/          pruebas del cliente del agente, con su README
```

---

## El agente: teaser, no demo

La sección del agente vende lo que viene —el flujo interno en pantalla: la
entrada, las llamadas a herramienta, el razonamiento y los tokens saliendo— y
enlaza al código, que ya es público. **Sin fecha prometida.**

El cliente de chat existe, está probado y **no se publica todavía**:

- `src/components/AgentChat.tsx` y `AgentDemo.tsx` se conservan en la rama.
- `DemoSection.tsx` NO los importa, así que Next no los mete en ningún chunk
  servido. Verificado en el build: ni `response.output_text.delta`, ni
  `agent-input`, ni el hostname del agente aparecen en `.next/static/`.
- Las cadenas del cliente siguen en el diccionario, completas y en los dos
  idiomas, bajo `demo.chat`.
- Las pruebas están en `tests/agent-demo/`, con su README.

**Para encenderla:** importar `AgentDemo` en `DemoSection`, pasarle
`dict.demo.chat` y `AGENT_CHAT_ENDPOINT`. Nada más.

### La arquitectura que ya está decidida

El navegador hablará **directo** con `/api/chat` del agente desplegado. Sin
proxy y sin credencial en ninguna parte.

`/v1/responses` exige Bearer y no se toca desde el sitio: una página web no
puede guardar una llave en secreto. La demo no se protege por identidad sino
por consumo, con un tope por IP en el backend.

Se descartó meter un route handler de Next en medio. Habría escondido el
hostname —que no es un secreto y ya se publica en `/.well-known/agent-card.json`—
a cambio de romper la protección real: todas las peticiones saldrían con la IP
del servidor y el tope por IP se volvería un cubo global para todo el sitio.
Reenviar `X-Forwarded-For` tampoco sirve, porque el cliente puede falsificarlo.

`/api/chat` es **sin estado**: descarta `previous_response_id`, así que el
cliente reenvía la transcripción completa en cada turno.

## Bilingüe

`/en` y `/es`, ambas estáticas vía `generateStaticParams`, con `hreflang` y
`x-default`. El selector es un `<a>` al camino espejo: cero JS.

La bandera `complete` de cada diccionario manda. Mientras sea `false`, ese idioma
queda fuera del sitemap y de los hreflang, se marca `noindex`, y el selector no
lo ofrece —aunque la ruta funciona para revisarla a mano.

**Los dos idiomas están terminados.** La bandera hizo su trabajo: ponerla en
`true` metió el español al sitemap, le quitó el `noindex`, lo sacó del
`Disallow` de robots y encendió el selector en las dos direcciones, sin tocar
una línea de arquitectura.

---

## Animación

Sin librerías: ni framer-motion, ni three.js, ni nada. La capa de animación de
secciones son unos 2 KB de JS; el fondo del héroe, 2.2 KB más en un chunk que
sólo se pide cuando se va a usar.

| Qué | Cómo |
|---|---|
| Contadores | El valor final se renderiza en el servidor; el JS sólo anima desde cero al entrar en pantalla. Existe sin JS y no hay salto de ancho (`tabular-nums`). |
| Entrada de secciones | Un solo `IntersectionObserver` para toda la página. Sólo `opacity` y `transform`. |
| Casos de estudio | `grid-template-rows: 0fr → 1fr`: altura animada sin medir nada en JS. |
| Fondo del héroe | Un shader de fragmento en WebGL crudo (WebGL2 con respaldo a WebGL1), sin three.js. Ver abajo. |

### El fondo del héroe

Un triángulo a pantalla completa y un shader de ruido que se mueve muy despacio.
**2 235 bytes gzip** añadidos al sitio completo, de los cuales 1 950 son un
chunk aparte que sólo se pide si de verdad se va a usar.

Fuera de la ruta crítica: el LCP es el texto de la tesis y se pinta sin esperar
a nada; la importación del shader arranca en `requestIdleCallback`.

Se cae al degradado CSS —que está siempre debajo y es una composición
terminada, no un hueco— si no hay WebGL, si se pierde el contexto, con
`prefers-reduced-motion: reduce`, o si `hardwareConcurrency <= 4`. En esos casos
**no se descargan los bytes**: el respaldo no es cargar y no usar.

El bucle se detiene cuando la pestaña no está visible y cuando el canvas sale
del viewport. El canvas va con `aria-hidden` y no toca el árbol de
accesibilidad.

El tope de brillo del shader no es una decisión estética, es de contraste: el
color más claro que puede producir está calculado para que todo color de texto
de la página siga pasando AA encima de él. Los números están en
`src/lib/glow.ts`; si se sube el tinte, hay que recalcularlos.

Con `prefers-reduced-motion: reduce` no hay animación, no una más corta. Sin JS,
un `<noscript>` deja todo visible: la entrada progresiva es una mejora, nunca un
requisito para leer la página.

---

## Medido, no estimado

Lighthouse móvil contra `next build && next start`, mediana de 3 corridas:

| Ruta | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/en` | **97** | **100** | **100** | **100** |
| `/es` | **99** | **100** | **100** | **100** |

FCP 0.91 s · LCP 1.87–2.46 s · TBT 78–98 ms · CLS ≤ 0.001

Coste del shader, aislado (misma página, 3 corridas cada una):

| | Rendimiento (mediana) | LCP (mediana) |
|---|---|---|
| Sin shader | 97 | 2.48 s |
| Con shader activo | 99 | 1.86 s |

Las tres condiciones se solapan dentro del ruido de la máquina de medición: el
shader no tiene coste medible. El umbral que se aplicó fue que por debajo de 95
se retiraba.

Cero violaciones de WCAG 2.1 AA con axe-core, en **los dos idiomas** y en todos
los estados interactivos: inicial, casos expandidos, menú móvil, escritorio y
movimiento reducido. Diez auditorías, cero violaciones. El recorrido de teclado
empieza en el skip link en ambos idiomas y ningún elemento enfocable se queda
sin anillo de foco.

---

## Correr en local

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm run build          # estático, ambos idiomas
npm run lint
npm run sync:perfil    # re-sincroniza perfil.yaml al SHA fijado en evidence.ts
```

### Subir a un commit nuevo del agente

1. Cambia `CV_AGENT_SHA` en `src/lib/evidence.ts`.
2. `npm run sync:perfil`
3. Revisa los números de línea de `CITES`: están fijados a ese SHA.

---

## Banderas pendientes

En `src/lib/site.ts`, construidas y apagadas:

| Bandera | Para encenderla |
|---|---|
| `RESUME_URL` | Sube el PDF a `public/` y pon su ruta. Aparece el botón de descarga en el héroe. |
| `PORTRAIT_URL` | Pon la ruta de la foto. El hueco ya está reservado en el héroe y en la imagen OG. |
| `AGENT_URL` | Se puede sobreescribir con `NEXT_PUBLIC_AGENT_URL`. Es pública por definición: nunca pongas aquí la llave del endpoint Bearer. |

---

## Privacidad

Sin teléfono y sin dirección. No es una omisión: `perfil.yaml` los declara como
datos no divulgables, y el sitio respeta la misma regla que el agente.
