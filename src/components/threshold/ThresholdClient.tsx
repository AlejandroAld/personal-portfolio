"use client";

import { useEffect } from "react";
import { choose, setThresholdHover, type Choice } from "@/lib/explorer";

/**
 * Los eventos del umbral: cursor y foco marcan una mitad (`data-hover` en
 * <html>, que mueve la geometría), las flechas cambian de opción, Enter o el
 * clic eligen, y el punto de fuga de la caída es donde se hizo clic.
 */
export default function ThresholdClient() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".threshold");
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(".th-option"));
    const sideOf = (el: Element | null) => (el?.closest<HTMLElement>("[data-choose], [data-side]")?.dataset.choose ?? el?.closest<HTMLElement>("[data-side]")?.dataset.side ?? null) as Choice | null;

    const onOver = (e: PointerEvent) => setThresholdHover(sideOf(e.target as Element));
    const onLeave = () => setThresholdHover(null);
    const onFocus = (e: FocusEvent) => setThresholdHover(sideOf(e.target as Element));
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (i < 0) return;
      e.preventDefault();
      buttons[(i + 1) % buttons.length].focus();
    };
    const onClick = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-choose]");
      const side = b?.dataset.choose as Choice | undefined;
      if (!side) return;
      // Con teclado no hay coordenadas: el punto de fuga es el centro del botón.
      const r = b!.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      choose(side, { x, y });
    };
    // Tocar el marco también elige (en el teléfono, cada mitad es un objetivo).
    const onFrameClick = (e: MouseEvent) => {
      const f = (e.target as HTMLElement).closest<HTMLElement>(".th-frame");
      if (!f) return;
      choose(f.dataset.side as Choice, { x: e.clientX, y: e.clientY });
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onLeave);
    root.addEventListener("keydown", onKey);
    root.addEventListener("click", onClick);
    root.addEventListener("click", onFrameClick);
    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onLeave);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      root.removeEventListener("click", onFrameClick);
    };
  }, []);
  return null;
}
