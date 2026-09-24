import type { Dictionary } from "@/content/dictionary";
import { persona } from "@/content/perfil";
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
 * Las opciones no llevan tiempo: "respuesta rápida" con doce minutos de
 * lectura contradecía a "razonamiento profundo" con dos, así que sólo van el
 * sobretítulo y el título. Las previsualizaciones son decorativas para
 * lectores de pantalla y no reciben foco (van `inert`); los dos botones son
 * reales, su nombre accesible es su texto, y las flechas cambian de opción.
 */
export default function Threshold({ dict }: { dict: Dictionary }) {
  return (
    // Mientras el umbral está a la vista, la columna va `inert` y no expone su
    // landmark ni su h1: aquí el umbral es el main y el nombre es el h1.
    <section className="threshold" role="main" aria-label={dict.threshold.groupAria}>
      <div className="th-top">
        <h1 className="th-name">
          {persona.nombre} <span className="text-subtle">· {dict.hero.eyebrow}</span>
        </h1>
        {/* La definición, literal de `umbral` en perfil.yaml. Entra con
            desplazamiento y sin fundido (rise-solid): es el LCP del umbral y
            Chrome no cuenta un elemento en opacidad 0; con movimiento reducido
            no hay animación. */}
        <p className="th-greet rise-solid">{dict.threshold.greeting}</p>
        <p className="th-def rise-solid rise-2">{dict.threshold.definition}</p>
        <p className="th-intro rise-solid rise-3">{dict.threshold.intro}</p>
      </div>

      {/* Los marcos: sólo el borde con profundidad. Lo de adentro es la página misma. */}
      <div className="th-frame th-frame-cv" aria-hidden="true" data-side="cv" />
      <div className="th-frame th-frame-explore" aria-hidden="true" data-side="explore" />

      <div className="th-options" role="group" aria-label={dict.threshold.groupAria}>
        <button type="button" className="th-option th-option-cv" data-choose="cv">
          <span className="th-kicker">{dict.threshold.cvKicker}</span>
          <span className="th-title">{dict.threshold.cvTitle}</span>
        </button>
        <button type="button" className="th-option th-option-explore" data-choose="explore">
          <span className="th-kicker">{dict.threshold.exploreKicker}</span>
          <span className="th-title">{dict.threshold.exploreTitle}</span>
        </button>
      </div>

      <ThresholdClient />
    </section>
  );
}
