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
    globals.css        tokens, evidencia, revelado, reduced-motion
  components/          secciones + islas de cliente:
                         Nav, Counter, Reveal/Stagger, ProjectCard,
                         HeroBackdrop, Motion (LazyMotion)
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

## Arquitectura de información

El orden es el de un portafolio, no el de un proyecto:

1. **Héroe** — una frase de posicionamiento y dos salidas: contacto y trabajo.
2. **Métricas** — cuatro números de cuatro empleadores y proyectos distintos.
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

| Qué | Cómo |
|---|---|
| Entrada al hacer scroll | `motion` con `whileInView` y `once: true`, con escalonado en las listas de tarjetas. |
| Contadores | Implementación propia, 600 bytes: el valor final se renderiza en el servidor —existe sin JS y lo indexa un buscador— y el JS sólo anima desde cero al entrar en pantalla. |
| Tarjetas de proyecto | Elevación corta en hover, más el borde que se enciende. |
| Cambio de idioma | `template.tsx` con un fundido corto. La primera carga NO se anima. |
| Fondo del héroe | Un shader de fragmento en WebGL crudo, sin three.js. Ver abajo. |

`motion` se carga con `LazyMotion` + `domAnimation` y el componente `m` desde
`motion/react-m`, con `strict` activo para que usar `motion.div` en vez de
`m.div` rompa en desarrollo: sin ese guarda, un import distraído vuelve a meter
el paquete entero y nadie se entera hasta que alguien mide.

**Dos detalles que no son opcionales:**

`motion` serializa el estado inicial como estilo en línea, así que un
`initial={{ opacity: 0 }}` acaba en el HTML del servidor. Por eso el `<h1>` no
va envuelto en nada animado —el LCP es ese texto— y por eso el `template` no
anima la primera carga: envolver la página entera habría metido `opacity:0` en
el HTML, retrasando el LCP hasta la hidratación y dejando la página invisible
sin JS. Para el resto, los bloques animados llevan `data-reveal` y un
`<noscript>` con `!important` los devuelve a la vista.

Con `prefers-reduced-motion: reduce` las variantes se sustituyen por unas que
no mueven ni funden nada, y el fundido entre idiomas se salta entero.

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

Lighthouse móvil contra `next build && next start`, mediana de 3 corridas:

| Ruta | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/en` | **99** | **100** | **100** | **100** |
| `/es` | **97** | **100** | **100** | **100** |

FCP 0.91 s · LCP 2.27–2.57 s · TBT 27–29 ms · CLS 0.001

Costo de `motion`, medido con dos builds del mismo contenido:

| | JS servido (gzip) | Rendimiento (mediana) |
|---|---|---|
| Sin motion | 175 156 B | 97 |
| Con motion | 217 008 B | 96–99 |

**41 852 bytes gzip (40.9 KB).** Es caro para lo que hace, y es el número, no
una estimación.

Cero violaciones de WCAG 2.1 AA con axe-core, en **los dos idiomas** y en todos
los estados: inicial, menú móvil, hover de tarjeta y movimiento reducido. Ocho
auditorías, cero violaciones. El recorrido de teclado empieza en el skip link
en ambos idiomas, ningún elemento enfocable se queda sin anillo de foco, y los
enlaces de fuente ocultos se hacen visibles al recibir el foco.

Sin JavaScript: 55 bloques animados, **0 invisibles**.

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
