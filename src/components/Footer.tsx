import type { Dictionary } from "@/content/dictionary";
import { perfil, persona } from "@/content/perfil";

export default function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs leading-relaxed text-subtle">
            {dict.footer.sourceNote}{" "}
            <a
              href={perfil._meta.fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="evidence"
            >
              <span aria-hidden="true">↗ </span>
              perfil.yaml
            </a>
          </p>
          <p className="mt-1 text-xs text-subtle">{dict.footer.builtWith}</p>
        </div>

        <p className="font-mono text-xs text-subtle">
          {persona.nombre} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
