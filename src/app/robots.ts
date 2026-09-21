import type { MetadataRoute } from "next";
import { LOCALES, absoluteUrl, getDictionary } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Los idiomas sin terminar se excluyen aquí además del `noindex` de la
  // página: dos capas, porque una traducción a medias indexada es difícil de
  // sacar después.
  const pendientes = LOCALES.filter((l) => !getDictionary(l).complete).map((l) => `/${l}`);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(pendientes.length ? { disallow: pendientes } : {}),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
