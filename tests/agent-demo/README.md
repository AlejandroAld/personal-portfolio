# Pruebas del cliente del agente

Verifican `src/components/AgentChat.tsx` contra un simulador que reproduce el
contrato SSE exacto del servidor real
([`app/openresponses.py:316`](https://github.com/AlejandroAld/cv-agent/blob/11e03a7482b07b2917be3b5d47ff267aeb44b4e5/app/openresponses.py#L316)):

```
event: <tipo>
data: {"type": "<tipo>", "sequence_number": n, ...}

data: [DONE]
```

## Por qué contra un simulador y no contra el agente real

Por dos razones, y las dos siguen valiendo:

1. El cliente tiene que comportarse bien ante 429, caída y evento `error`, y
   provocar esos tres estados contra el servicio desplegado no es práctico
   —el 429 exige quemar el límite por IP de verdad—.
2. Cuando se escribieron, la política de red del entorno bloqueaba la salida
   al Container App. La verificación contra el endpoint real sigue pendiente y
   es lo primero que hay que hacer el día que la demo se publique.

## Estado: el cliente no está publicado

`DemoSection.tsx` no importa `AgentDemo`, así que hoy la página no monta el
chat y **estos scripts no corren contra el sitio tal como está**. Se conservan
porque el trabajo ya está hecho y verificado, y volver a escribirlo el día del
lanzamiento sería tirar esa verificación.

Para correrlos hay que encender la demo primero (ver la nota de cabecera en
`src/components/AgentChat.tsx`).

## Cómo correrlos

```bash
# 1. Enciende la demo en DemoSection.tsx
# 2. Levanta el simulador en el modo que quieras probar
MODE=ok PORT=3210 node tests/agent-demo/mock-agent.mjs &

# 3. Compila apuntando al simulador y sirve
NEXT_PUBLIC_AGENT_URL=http://localhost:3210 npm run build
npx next start -p 3100 &

# 4. Corre las pruebas
export CHROME_PATH=/ruta/a/chrome
node tests/agent-demo/demo-test.mjs http://localhost:3100/en stream
node tests/agent-demo/multiturn.mjs  http://localhost:3100/en
```

Modos del simulador: `ok`, `rate_limit`, `error`.

```bash
MODE=rate_limit node tests/agent-demo/mock-agent.mjs &
node tests/agent-demo/demo-test.mjs http://localhost:3100/en rate_limit

MODE=error node tests/agent-demo/mock-agent.mjs &
node tests/agent-demo/demo-test.mjs http://localhost:3100/en error
```

## Qué cubren

| Script | Qué verifica |
|---|---|
| `demo-test.mjs stream` | El chunk diferido carga al pulsar; los deltas SSE se acumulan en el texto correcto; `aria-live="polite"` en el registro; el input se vuelve a habilitar; cero errores de página. |
| `demo-test.mjs rate_limit` | Un 429 muestra el mensaje del límite por IP en un `role="alert"`, sin romper la sección. |
| `demo-test.mjs error` | Un evento `error` en mitad del stream muestra el mensaje de fallo y descarta la respuesta a medias. |
| `multiturn.mjs` | El cliente reenvía la transcripción completa: 1 item en el primer turno, 3 en el segundo. Es lo que exige un endpoint sin estado que descarta `previous_response_id`. |

## Último resultado conocido

2026-09-21, contra el simulador, con el chat publicado: los cuatro pasaron.
`items recibidos: 1` y luego `items recibidos: 3`, confirmando el reenvío de
transcripción.
