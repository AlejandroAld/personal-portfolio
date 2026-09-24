import type { ReactNode } from "react";
import { nodeById, type Locale, type NodeId } from "@/lib/map-graph";
import RoomClose from "./RoomClose";

/**
 * Una sala: la sección de un nodo.
 *
 * En Modo CV (y sin JavaScript) es una sección más de la columna. En modo
 * explorar sólo la sala activa se muestra, como panel encima del mapa; el
 * explorador pone `data-active` y el CSS hace el resto. El nodo se convierte
 * en la sala: la etiqueta del mapa viaja hasta el nombre del nodo de aquí
 * arriba (el explorador anima el fantasma), y el contenido entra en cascada
 * —nombre, título, entrada, cuerpo— con 40 a 60 ms entre uno y otro, todo
 * legible antes de 700 ms desde el clic. El título es CV puro; el nombre del
 * nodo es el único vocabulario del marco.
 */
export default function Room({
  id,
  locale,
  agent,
  name,
  title,
  intro,
  closeLabel,
  active,
  children,
}: {
  id: NodeId;
  locale: Locale;
  agent: string | null;
  name: string;
  title: string;
  intro?: string;
  closeLabel: string;
  active: boolean;
  children: ReactNode;
}) {
  const slug = nodeById(id).slug[locale];
  return (
    <section id={slug} className="room" data-node={id} data-active={active ? "" : undefined} aria-labelledby={`${id}-title`}>
      <div className="room-inner">
        <header className="room-head">
          <p className="room-kicker cascade" style={{ ["--k" as string]: 0 }}>
            {agent && (
              <>
                <span className="room-agent">{agent}</span>
                <span className="room-kicker-sep" aria-hidden="true">
                  {" · "}
                </span>
              </>
            )}
            <span className="room-name">{name}</span>
          </p>
          <h2 id={`${id}-title`} className="room-title cascade" tabIndex={-1} style={{ ["--k" as string]: 1 }}>
            {title}
          </h2>
          {intro && (
            <p className="room-intro cascade" style={{ ["--k" as string]: 2 }}>
              {intro}
            </p>
          )}
          <RoomClose label={closeLabel} />
        </header>
        <div className="room-body cascade" style={{ ["--k" as string]: 3 }}>
          {children}
        </div>
      </div>
    </section>
  );
}
