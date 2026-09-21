/**
 * Simulador de /api/chat del agente de CV.
 *
 * Reproduce el contrato exacto del servidor real (app/openresponses.py:316):
 *   event: <tipo>\ndata: {"type": <tipo>, "sequence_number": n, ...}\n\n
 * y el terminal literal `data: [DONE]\n\n`.
 *
 * Existe porque la política de red de este entorno bloquea la salida al
 * Container App, así que el cliente se verifica contra el mismo formato de
 * eventos en local: parser SSE, streaming, 429 y evento de error.
 *
 *   MODE=ok | rate_limit | error | offline
 */
import { createServer } from "node:http";

const MODE = process.env.MODE ?? "ok";
const PORT = Number(process.env.PORT ?? 3210);

const RESPUESTA =
  "Several things, and I'd rather say them before they come up. I haven't written .NET or C#, or Rust. " +
  "I haven't used PySpark, Databricks or Airflow; my distributed compute has been BigQuery.";

let seq = 0;
const evento = (tipo, campos = {}) => {
  seq += 1;
  return `event: ${tipo}\ndata: ${JSON.stringify({ type: tipo, sequence_number: seq, ...campos })}\n\n`;
};

const server = createServer(async (req, res) => {
  // CORS igual que el servidor real: allow_origins=["*"] (app/main.py:48).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.writeHead(204).end();
  if (!req.url?.startsWith("/api/chat")) return res.writeHead(404).end();

  if (MODE === "rate_limit") {
    res.writeHead(429, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        error: { message: "Límite de 20 mensajes por hora alcanzado.", type: "rate_limit", param: null, code: "rate_limit_exceeded" },
      }),
    );
  }

  // Leer el cuerpo para comprobar que el cliente manda la transcripción.
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  process.stdout.write(`[mock] items recibidos: ${body.input?.length ?? 0}\n`);

  seq = 0;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  });
  res.write(evento("response.created", { response: { id: "resp_mock", status: "in_progress" } }));

  if (MODE === "error") {
    res.write(evento("error", { message: "El agente no pudo responder.", code: "server_error", param: null }));
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  // Deltas token a token, como el streaming real.
  const palabras = RESPUESTA.split(" ");
  for (let i = 0; i < palabras.length; i++) {
    res.write(evento("response.output_text.delta", { delta: (i ? " " : "") + palabras[i] }));
    await new Promise((r) => setTimeout(r, 12));
  }

  res.write(evento("response.completed", { response: { id: "resp_mock", status: "completed" } }));
  res.write("data: [DONE]\n\n");
  res.end();
});

server.listen(PORT, () => process.stdout.write(`[mock] ${MODE} en :${PORT}\n`));
