/**
 * El explorador: dónde está la lectura dentro del mapa.
 *
 * Un solo almacén para la escena 3D, las etiquetas, la ruta y las salas.
 * Tres niveles —mapa, nodo, subnodo— y dos formas de moverse: el scroll es un
 * tour guiado que vuela de nodo en nodo en orden (TOUR), y el clic o el toque
 * es exploración libre. Las dos mantienen sincronizados la URL, la posición
 * de scroll y el estado.
 *
 * Cada nodo y subnodo tiene su URL. La navegación va por `history.pushState`:
 * todas las rutas del mapa renderizan la misma página, así que no hay nada
 * que pedir al servidor; el botón de atrás vuelve al nivel anterior y un
 * enlace directo abre la sala de entrada (el HTML del servidor ya la trae
 * abierta).
 *
 * El almacén también pone los atributos que el CSS lee: `data-mode` en
 * <html> (explorar o CV), `data-level` (map | node | sub), `data-active` en
 * la sala abierta y `data-active-sub` en el subnodo.
 */

import { useMemo, useSyncExternalStore } from "react";
import { LABELED, TOUR, parsePath, pathFor, stopIndex, type Locale, type NodeId } from "./map-graph";
import { FLIGHT_MS } from "./tokens";

export type Mode = "explore" | "cv";
export type Level = "map" | "node" | "sub";

export interface ExplorerState {
  readonly mode: Mode;
  readonly node: NodeId | null;
  readonly sub: string | null;
  readonly level: Level;
  readonly stop: number;
  readonly reduced: boolean;
  readonly portrait: boolean;
  /** Sube con cada vuelo de cámara; la escena lo usa para arrancar la interpolación. */
  readonly flight: number;
}

const STORAGE_KEY = "modo";

let locale: Locale = "en";
let state: ExplorerState = { mode: "cv", node: null, sub: null, level: "map", stop: 0, reduced: false, portrait: false, flight: 0 };
const listeners = new Set<() => void>();
const labels = new Map<NodeId, HTMLElement>();
let bound = false;

function levelOf(node: NodeId | null, sub: string | null): Level {
  if (!node || node === "core") return "map";
  return sub ? "sub" : "node";
}

function emit() {
  listeners.forEach((l) => l());
}

export function getExplorer(): ExplorerState {
  return state;
}

export function subscribeExplorer(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Estado del explorador para un componente. Antes de que el almacén arranque
 * (en el servidor y en la hidratación) devuelve lo que trae la URL, que es lo
 * mismo que el HTML del servidor describe; después, el estado vivo.
 */
export function useExplorer(initial: { node: NodeId | null; sub: string | null }): ExplorerState {
  const initialSnapshot = useMemo<ExplorerState>(
    () => ({
      mode: "cv",
      node: initial.node,
      sub: initial.sub,
      level: levelOf(initial.node, initial.sub),
      stop: stopIndex(initial.node, initial.sub),
      reduced: false,
      portrait: false,
      flight: 0,
    }),
    [initial.node, initial.sub],
  );
  return useSyncExternalStore(
    subscribeExplorer,
    () => (bound ? state : initialSnapshot),
    () => initialSnapshot,
  );
}

/** Las etiquetas del mapa se registran para que la escena las coloque cada cuadro. */
export function registerLabel(id: NodeId, el: HTMLElement | null) {
  if (el) labels.set(id, el);
  else labels.delete(id);
}

export function labelElement(id: NodeId): HTMLElement | undefined {
  return labels.get(id);
}

/* ---------------------------------------------------------------------------
   El tour: qué desplazamiento corresponde a cada parada
   --------------------------------------------------------------------------- */

function heroHeight(): number {
  return window.innerHeight;
}
function stopHeight(): number {
  return Math.round(window.innerHeight * 0.7);
}

export function stopOffset(i: number): number {
  return i <= 0 ? 0 : heroHeight() + (i - 1) * stopHeight();
}

function stopAt(scrollY: number): number {
  const h = heroHeight();
  if (scrollY < h * 0.5) return 0;
  const s = stopHeight();
  return Math.min(TOUR.length - 1, 1 + Math.floor((scrollY - h + s * 0.5) / s));
}

function layoutTour() {
  const spacer = document.querySelector<HTMLElement>(".tour");
  if (spacer) spacer.style.height = `${stopOffset(TOUR.length - 1) + window.innerHeight}px`;
}

function scrollToStop(i: number) {
  const top = stopOffset(i);
  if (Math.abs(window.scrollY - top) < 2) return;
  window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
}

/* ---------------------------------------------------------------------------
   Atributos que lee el CSS
   --------------------------------------------------------------------------- */

function applyDom(prev: ExplorerState | null) {
  const html = document.documentElement;
  html.dataset.mode = state.mode;
  html.dataset.level = state.level;

  for (const room of document.querySelectorAll<HTMLElement>(".room[data-node]")) {
    const active = state.node !== null && room.dataset.node === state.node;
    if (active) room.setAttribute("data-active", "");
    else room.removeAttribute("data-active");
    for (const art of room.querySelectorAll<HTMLElement>("[data-sub]")) {
      if (active && state.sub && art.dataset.sub === state.sub) art.setAttribute("data-active-sub", "");
      else art.removeAttribute("data-active-sub");
    }
    if (active && state.mode === "explore") {
      room.setAttribute("role", "dialog");
      room.setAttribute("aria-modal", "true");
      if (!prev || prev.node !== state.node || prev.sub !== state.sub) room.scrollTop = 0;
    } else {
      room.removeAttribute("role");
      room.removeAttribute("aria-modal");
    }
  }

  // Con una sala abierta, lo que queda detrás no se puede enfocar.
  const inertBehind = state.mode === "explore" && state.level !== "map";
  for (const el of document.querySelectorAll<HTMLElement>(".core, .map-labels")) {
    if (inertBehind) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }
}

function set(next: Partial<ExplorerState>) {
  const prev = state;
  state = { ...state, ...next };
  state = { ...state, level: levelOf(state.node, state.sub) };
  applyDom(prev);
  emit();
}

/* ---------------------------------------------------------------------------
   Navegación
   --------------------------------------------------------------------------- */

function pushUrl(node: NodeId | null, sub: string | null, replace = false) {
  const url = pathFor(locale, node, sub);
  if (window.location.pathname === url) return;
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
}

function focusRoom() {
  const title = document.querySelector<HTMLElement>(".room[data-active] .room-title");
  title?.focus({ preventScroll: true });
}

function goTo(node: NodeId | null, sub: string | null, opts: { push?: boolean; scroll?: boolean; focus?: boolean } = {}) {
  const { push = true, scroll = true, focus = true } = opts;
  const target = node === "core" ? null : node;
  const stop = stopIndex(target, sub);
  const changed = target !== state.node || sub !== state.sub;
  if (push) pushUrl(target, sub, !changed);
  set({ node: target, sub, stop, flight: changed ? state.flight + 1 : state.flight });
  if (scroll && state.mode === "explore") scrollToStop(stop);
  if (focus && changed) {
    if (target) focusRoom();
    else if (node) labelElement(node)?.focus({ preventScroll: true });
  }
}

/** Entrar a un nodo o a un subnodo (clic, toque, Enter, enlace). */
export function enter(node: NodeId | null, sub: string | null = null) {
  goTo(node, sub);
}

/** Salir un nivel: del subnodo al nodo, del nodo al mapa. */
export function exit() {
  if (state.level === "map") return;
  const leaving = state.node;
  if (state.level === "sub") {
    goTo(state.node, null);
    return;
  }
  goTo(null, null, { focus: false });
  if (leaving) labelElement(leaving)?.focus({ preventScroll: true });
}

export function setMode(mode: Mode) {
  if (mode === state.mode) return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* sin almacenamiento, el modo dura la visita */
  }
  const { node } = state;
  set({ mode });
  if (mode === "cv") {
    // Se sigue leyendo donde se iba: la sección del nodo abierto.
    const room = node ? document.querySelector<HTMLElement>(`.room[data-node="${node}"]`) : null;
    if (room) room.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  } else {
    layoutTour();
    scrollToStop(state.stop);
  }
}

export function toggleMode() {
  setMode(state.mode === "cv" ? "explore" : "cv");
}

/* ---------------------------------------------------------------------------
   Eventos del documento
   --------------------------------------------------------------------------- */

let frame = 0;
function onScroll() {
  if (state.mode !== "explore" || frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    const y = window.scrollY;
    // El héroe se apaga conforme el tour arranca.
    const t = Math.min(1, Math.max(0, y / (heroHeight() * 0.5)));
    document.documentElement.style.setProperty("--tour-t", t.toFixed(3));
    const i = stopAt(y);
    if (i !== state.stop) {
      const s = TOUR[i];
      goTo(s.node, s.sub, { scroll: false, focus: false });
    }
  });
}

function onPopState() {
  const parsed = parsePath(locale, window.location.pathname);
  if (!parsed) return;
  goTo(parsed.node, parsed.sub, { push: false });
}

function onKey(e: KeyboardEvent) {
  if (state.mode !== "explore") return;
  if (e.key === "Escape") {
    // El menú móvil se cierra solo con su propio Esc; no cerramos la sala a la vez.
    if (document.getElementById("mobile-nav")) return;
    if (state.level !== "map") {
      e.preventDefault();
      exit();
    }
    return;
  }
  const el = e.target as HTMLElement | null;
  const onLabel = el?.classList.contains("map-label");
  if (!onLabel) return;
  const order = LABELED;
  const current = order.indexOf(el!.dataset.node as NodeId);
  let next = -1;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % order.length;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + order.length) % order.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = order.length - 1;
  if (next < 0) return;
  e.preventDefault();
  labelElement(order[next])?.focus();
}

/** Cualquier enlace con `data-enter` navega dentro del mapa sin recargar. */
function onClick(e: MouseEvent) {
  if (state.mode !== "explore") return;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as HTMLElement).closest<HTMLElement>("[data-enter]");
  if (!a) return;
  e.preventDefault();
  const node = (a.dataset.enter || null) as NodeId | null;
  const sub = a.dataset.sub || null;
  enter(node, sub);
}

// Pellizcar en el teléfono cierra la sala.
let pinchStart = 0;
let pinched = false;
function distance(t: TouchList) {
  return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
}
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    pinchStart = distance(e.touches);
    pinched = false;
  }
}
function onTouchMove(e: TouchEvent) {
  if (e.touches.length !== 2 || pinched || !pinchStart || state.level === "map") return;
  if (distance(e.touches) / pinchStart < 0.7) {
    pinched = true;
    exit();
  }
}

function onResize() {
  const portrait = window.innerWidth / window.innerHeight < 0.9;
  layoutTour();
  if (portrait !== state.portrait) set({ portrait });
  if (state.mode === "explore") scrollToStop(state.stop);
}

/** Arranca el explorador. Lo llama <Explorer> al montar; devuelve la limpieza. */
export function initExplorer(loc: Locale, initial: { node: NodeId | null; sub: string | null }): () => void {
  locale = loc;
  const html = document.documentElement;
  const mode: Mode = html.dataset.mode === "cv" ? "cv" : "explore";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portrait = window.innerWidth / window.innerHeight < 0.9;
  const fromUrl = parsePath(loc, window.location.pathname) ?? initial;
  const node = fromUrl.node === "core" ? null : fromUrl.node;

  window.history.scrollRestoration = "manual";
  state = { mode, node, sub: fromUrl.sub, level: levelOf(node, fromUrl.sub), stop: stopIndex(node, fromUrl.sub), reduced, portrait, flight: 0 };
  applyDom(null);
  layoutTour();
  if (mode === "explore") scrollToStop(state.stop);
  bound = true;
  emit();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("popstate", onPopState);
  document.addEventListener("keydown", onKey);
  document.addEventListener("click", onClick);
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: true });
  onScroll();

  return () => {
    bound = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("popstate", onPopState);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onClick);
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchmove", onTouchMove);
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  };
}

export { FLIGHT_MS };
