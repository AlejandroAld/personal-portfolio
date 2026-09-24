import type { Dictionary } from "@/content/dictionary";
import { persona } from "@/content/perfil";
import { readingTimes } from "@/lib/reading-time";
import ThresholdClient from "./ThresholdClient";

/**
 * El umbral: la entrada donde se elige cómo conocerme.
 *
 * En la primera visita, antes de todo: arriba el nombre, el rol y una
 * explicación breve; abajo la pantalla dividida en dos, cada mitad con una
 * previsualización viva de su modo dentro de un marco con profundidad. Las
 * previsualizaciones no son capturas: la izquierda es la columna real del CV
 * (`main.page`) a escala, con un desplazamiento lento que se detiene al pasar
 * el cursor; la derecha es el mapa real (`.stage`), el mismo lienzo que
 * después ocupa la pantalla completa, con el SVG de respaldo mientras carga.
 * Aquí sólo van los marcos y las dos opciones; la geometría de las dos
 * mitades vive en variables CSS que comparten marco, previsualización y
 * botón, y cambia al pasar el cursor.
 *
 * Los tiempos se calculan sobre el texto real (`src/lib/reading-time.ts`).
 * Las previsualizaciones son decorativas para lectores de pantalla y no
 * reciben foco (van `inert`); los dos botones son reales, con el tiempo en su
 * nombre accesible, y las flechas cambian de opción.
 */
export default function Threshold({ dict }: { dict: Dictionary }) {
  const t = readingTimes(dict);
  const cvTime = dict.threshold.minutes.replace("{n}", String(t.cvMinutes));
  const exploreTime = dict.threshold.minutes.replace("{n}", String(t.tourMinutes));
  const aria = (title: string, time: string) => dict.threshold.optionAria.replace("{title}", title).replace("{time}", time);

  return (
    // Mientras el umbral está a la vista, la columna va `inert` y no expone su
    // landmark ni su h1: aquí el umbral es el main y el nombre es el h1.
    <section className="threshold" role="main" aria-label={dict.threshold.groupAria}>
      <div className="th-top">
        <h1 className="th-name">
          {persona.nombre} <span className="text-subtle">· {dict.hero.eyebrow}</span>
        </h1>
        <p className="th-intro">{dict.threshold.intro}</p>
      </div>

      {/* Los marcos: sólo el borde con profundidad. Lo de adentro es la página misma. */}
      <div className="th-frame th-frame-cv" aria-hidden="true" data-side="cv" />
      <div className="th-frame th-frame-explore" aria-hidden="true" data-side="explore" />

      <div className="th-options" role="group" aria-label={dict.threshold.groupAria}>
        <button type="button" className="th-option th-option-cv" data-choose="cv" aria-label={aria(dict.threshold.cvTitle, cvTime)}>
          <span className="th-kicker">{dict.threshold.cvKicker}</span>
          <span className="th-title">{dict.threshold.cvTitle}</span>
          <span className="th-time tnum">{cvTime}</span>
        </button>
        <button type="button" className="th-option th-option-explore" data-choose="explore" aria-label={aria(dict.threshold.exploreTitle, exploreTime)}>
          <span className="th-kicker">{dict.threshold.exploreKicker}</span>
          <span className="th-title">{dict.threshold.exploreTitle}</span>
          <span className="th-time tnum">{exploreTime}</span>
        </button>
      </div>

      <ThresholdClient />
    </section>
  );
}
