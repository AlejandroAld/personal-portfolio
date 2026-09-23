import type { Dictionary } from "@/content/dictionary";
import { educacion, term } from "@/content/perfil";
import SourceLink from "../SourceLink";

/**
 * System prompt · Quién soy: quién soy, qué busco, cómo pienso, y la frase
 * del ingreso en 2021 con sus fuentes. Todo CV; el nombre del nodo es lo
 * único que viene del marco.
 */
export default function WhoIAm({ dict }: { dict: Dictionary }) {
  const contexto = dict.context.contextLine ?? educacion.contexto;
  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
      <div className="lg:col-span-3">
        <p className="leading-relaxed text-muted text-pretty">{dict.hero.summary}</p>

        <h3 className="label mt-10">{dict.who.lookingFor}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{dict.hero.availability}</p>

        <h3 className="label mt-10">{dict.who.since2021}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted text-pretty">{contexto}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-micro text-subtle">
          <span>{dict.context.sources}:</span>
          {educacion.fuentes.map((f) => (
            <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 transition-colors hover:text-accent">
              {term(f.descripcion, dict)}
            </a>
          ))}
        </p>
        <SourceLink cite="educationContext" ariaLabel={dict.footer.sourceAria} className="mt-2" />
      </div>

      <div className="lg:col-span-2">
        <h3 className="label">{dict.thinking.eyebrow}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{dict.thinking.intro}</p>
        <ol className="mt-5 space-y-4">
          {dict.thinking.items.map((item) => (
            <li key={item.id} id={item.id} className="card p-5">
              <h4 className="text-sm font-semibold tracking-tight text-fg text-balance">{item.title}</h4>
              <dl className="mt-3 space-y-3">
                <div>
                  <dt className="label">{dict.thinking.symptom}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted text-pretty">{item.symptom}</dd>
                </div>
                <div>
                  <dt className="label text-accent">{dict.thinking.fix}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted text-pretty">{item.fix}</dd>
                </div>
                <div>
                  <dt className="label">{dict.thinking.lesson}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg text-pretty">{item.lesson}</dd>
                </div>
              </dl>
              {item.cites[0] && <SourceLink cite={item.cites[0]} ariaLabel={dict.footer.sourceAria} className="mt-4" />}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
