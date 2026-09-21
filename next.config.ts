import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La raíz manda al idioma por defecto. Es un redirect estático en la
  // configuración, no middleware: no hay función en el borde que pagar ni
  // latencia que añadir en cada visita.
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
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
