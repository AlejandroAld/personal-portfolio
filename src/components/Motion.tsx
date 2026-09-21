"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * El proveedor de animación.
 *
 * `LazyMotion` con `domAnimation` carga sólo el subconjunto que este sitio usa
 * —animaciones de DOM, sin layout projection ni drag—, que es la diferencia
 * entre unos 18 KB y el paquete completo.
 *
 * `strict` no es decorativo: hace que usar `motion.div` en vez de `m.div`
 * lance un error en desarrollo. Sin él, un solo import distraído vuelve a meter
 * el bundle entero y nadie se entera hasta que alguien mide.
 *
 * `reducedMotion="user"` desactiva las animaciones de transform en cuanto el
 * sistema pide movimiento reducido. Encima de eso, los componentes de abajo
 * consultan la preferencia y se saltan también el fundido: ninguna animación,
 * no una más corta.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
