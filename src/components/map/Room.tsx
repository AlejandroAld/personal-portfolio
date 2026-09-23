import type { ReactNode } from "react";
import { nodeById, type Locale, type NodeId } from "@/lib/map-graph";
import RoomClose from "./RoomClose";

/**
 * Una sala: la sección de un nodo.
 *
 * En Modo CV (y sin JavaScript) es una sección más de la columna. En modo
 * explorar sólo la sala activa se muestra, como panel encima del mapa; el
 * explorador pone `data-active` y el CSS hace el resto. El encabezado lleva
 * el nombre del nodo —el término de agente y el término normal— y debajo el
 * título de la sección, que es CV puro.
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
          <p className="room-kicker">
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
          <h2 id={`${id}-title`} className="room-title" tabIndex={-1}>
            {title}
          </h2>
          {intro && <p className="room-intro">{intro}</p>}
          <RoomClose label={closeLabel} />
        </header>
        <div className="room-body">{children}</div>
      </div>
    </section>
  );
}
