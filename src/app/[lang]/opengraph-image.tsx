import { ImageResponse } from "next/og";
import { persona } from "@/content/perfil";
import { LOCALES, getDictionary, isLocale } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "José Alejandro Aldama Ramos — AI Engineer";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/**
 * Imagen Open Graph, generada en build desde el mismo contenido que la página.
 * Si la tesis o una métrica cambian, la tarjeta que se comparte cambia con
 * ellas; no hay un PNG suelto que se quede viejo.
 *
 * El hueco del retrato está reservado a la derecha: cuando exista la foto, se
 * coloca ahí sin rehacer la composición.
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "en");

  // El guion menos tipográfico no está en todas las fuentes del renderizador;
  // en la tarjeta se usa uno ASCII para que nunca salga un cuadro vacío.
  const metrics = dict.hero.metrics.map((m) => ({
    value: m.value.replace("−", "-"),
    label: m.label,
  }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ededed",
          padding: "68px 72px",
          borderTop: "8px solid #3b82f6",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 24, color: "#3b82f6", letterSpacing: 0.5 }}>
            {persona.nombre}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 24,
              fontSize: 62,
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            {`${dict.hero.thesis} ${dict.hero.thesisAccent}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  // Una cifra y una palabra no piden el mismo tamaño: igualarlos
                  // descuadra la fila.
                  fontSize: /^[-\d]/.test(m.value) ? 44 : 30,
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {m.value}
              </div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 18, color: "#a1a1aa", lineHeight: 1.35 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
