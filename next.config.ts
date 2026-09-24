import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

/**
 * "Bajo el capó" sólo existe cuando las dos corridas del agente están
 * grabadas (`src/content/runs/*.json` con status "recorded", que es lo que
 * `scripts/check-runs.mjs` valida en cada lint). Mientras no, el nodo, su
 * enlace en la barra y su sala no se renderizan, y su URL redirige al mapa.
 * La bandera se decide aquí, al construir, y llega al código como
 * NEXT_PUBLIC_HOOD_AVAILABLE: los JSON de las corridas no entran al bundle.
 */
const runRecorded = (lang: string): boolean => {
  const run = JSON.parse(readFileSync(join(process.cwd(), "src", "content", "runs", `${lang}.json`), "utf8")) as { status?: string };
  return run.status === "recorded";
};
const HOOD_AVAILABLE = ["es", "en"].every(runRecorded);
// Los slugs son los de `hood` en src/lib/map-graph.ts.
const HOOD_REDIRECTS = [
  { source: "/es/bajo-el-capo", destination: "/es", permanent: false },
  { source: "/en/under-the-hood", destination: "/en", permanent: false },
];

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_HOOD_AVAILABLE: HOOD_AVAILABLE ? "1" : "0" },

  // La raíz manda al idioma por defecto. Es un redirect estático en la
  // configuración, no middleware: no hay función en el borde que pagar ni
  // latencia que añadir en cada visita.
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }, ...(HOOD_AVAILABLE ? [] : HOOD_REDIRECTS)];
  },

  // Cabeceras de seguridad. No cuestan rendimiento y evitan una clase entera
  // de sorpresas en un sitio que embebe una demo de terceros.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
