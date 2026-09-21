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
  components/          secciones + tres islas de cliente (Nav, Counter, chat)
  content/
    perfil.json        GENERADO — no editar a mano
    perfil.ts          acceso tipado + formateo de fechas
    dictionary.ts      la forma del contenido
    en.ts              prosa en inglés  (completo)
    es.ts              prosa en español (PENDIENTE)
  lib/
    evidence.ts        SHA fijado + todas las citas, en un solo lugar
    site.ts            dominio, endpoint del agente, idiomas, banderas
scripts/
  sync-perfil.mjs      trae perfil.yaml del repo del agente
```

---

## La demo en vivo

El navegador habla **directo** con `/api/chat` del agente desplegado. Sin proxy
y sin credencial en ninguna parte.

`/v1/responses` exige Bearer y no se toca desde aquí: una página web no puede
guardar una llave en secreto. La demo no se protege por identidad sino por
consumo, con un tope por IP en el backend.

Se descartó meter un route handler de Next en medio. Habría escondido el
hostname —que no es un secreto y ya se publica en `/.well-known/agent-card.json`—
a cambio de romper la protección real: todas las peticiones saldrían con la IP
del servidor y el tope por IP se volvería un cubo global para todo el sitio.
Reenviar `X-Forwarded-For` tampoco sirve, porque el cliente puede falsificarlo.

`/api/chat` es **sin estado**: descarta `previous_response_id`, así que el
cliente reenvía la transcripción completa en cada turno.

La sección degrada sin romperse. El intercambio guardado se renderiza siempre en
el servidor —lo indexa un buscador y se lee sin pulsar nada— y los errores de
429, caída y evento `error` apuntan a él. Las respuestas guardadas son las que el
propio perfil fija para esas preguntas; ninguna se redactó para esta página.

---

## Bilingüe

`/en` y `/es`, ambas estáticas vía `generateStaticParams`, con `hreflang` y
`x-default`. El selector es un `<a>` al camino espejo: cero JS.

La bandera `complete` de cada diccionario manda. Mientras sea `false`, ese idioma
queda fuera del sitemap y de los hreflang, se marca `noindex`, y el selector no
lo ofrece —aunque la ruta funciona para revisarla a mano.

**Estado: el español está pendiente.** Para terminarlo: traduce los bloques de
`src/content/es.ts` desde `perfil.yaml` (que ya está en español, así que la mayor
parte es copiar) y pon `complete: true`. No hay que tocar nada de arquitectura.

---

## Animación

Sin librerías. Toda la capa son unos 2 KB de JS:

| Qué | Cómo |
|---|---|
| Contadores | El valor final se renderiza en el servidor; el JS sólo anima desde cero al entrar en pantalla. Existe sin JS y no hay salto de ancho (`tabular-nums`). |
| Entrada de secciones | Un solo `IntersectionObserver` para toda la página. Sólo `opacity` y `transform`. |
| Casos de estudio | `grid-template-rows: 0fr → 1fr`: altura animada sin medir nada en JS. |

Con `prefers-reduced-motion: reduce` no hay animación, no una más corta. Sin JS,
un `<noscript>` deja todo visible: la entrada progresiva es una mejora, nunca un
requisito para leer la página.

---

## Medido, no estimado

Lighthouse móvil contra `next build && next start`:

| Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|
| **99** | **100** | **100** | **100** |

FCP 0.9 s · LCP 1.9 s · TBT 80 ms · CLS 0.001

Cero violaciones de WCAG 2.1 AA con axe-core, incluidos los estados que
Lighthouse no ve: chat abierto, casos expandidos y menú móvil. Los ratios de
contraste están anotados en `globals.css`.

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
