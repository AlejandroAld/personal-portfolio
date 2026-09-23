import type { Dictionary } from "@/content/dictionary";
import { perfil, persona } from "@/content/perfil";

/**
 * El pie.
 *
 * Aquí, una sola vez, está la explicación que antes se repetía bajo cada
 * bloque: todo el contenido se genera desde un YAML, y este es el enlace.
 * Decirlo una vez informa; decirlo veinte veces es ruido.
 */
export default function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="page border-t border-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs leading-relaxed text-subtle text-pretty">
            {dict.footer.generated}{" "}
            <a
              href={perfil._meta.fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-accent"
            >
              {dict.footer.generatedLink} ↗
            </a>
          </p>
          <p className="mt-2 text-xs text-subtle">{dict.footer.builtWith}</p>
        </div>

        <p className="shrink-0 font-mono text-xs text-subtle">
          {persona.nombre} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
