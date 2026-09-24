/**
 * El explorador: dónde está la lectura dentro del sitio.
 *
 * Un solo almacén para el umbral, la escena 3D, las etiquetas, la ruta, el
 * interruptor y las salas. Tres modos —umbral, explorar, CV— y, dentro de
 * explorar, tres niveles: mapa, nodo y subnodo. Dos formas de moverse: el
 * scroll es un tour guiado que arrastra la cámara por una trayectoria
 * continua que pasa por todas las paradas, y el clic, el toque o Enter es
 * exploración libre. Las dos mantienen sincronizados la URL, el scroll y el
 * estado.
 *
 * URLs: cada nodo y subnodo tiene la suya; entrar con clic, toque o Enter
 * hace `pushState`; el tour por scroll hace `replaceState`; el Modo CV vive
 * en /es/cv y /en/cv. Todas las rutas renderizan la misma página, así que
 * nada se pide al servidor.
 *
 * El umbral sale sólo la primera vez; la elección se guarda en el navegador
 * y después el sitio abre en el último modo elegido. Un enlace directo se lo
 * salta. Elegir es una caída dentro del modo elegido (`choose`), y cambiar de
 * modo desde el interruptor es la misma caída en corto (`switchMode`).
 *
 * El almacén también pone los atributos que el CSS lee: `data-mode`,
 * `data-level`, `data-hover`, `data-falling` en <html>; `data-active` en la
 * sala abierta y `data-active-sub` en el subnodo.
 */

import { useMemo, useSyncExternalStore } from "react";
import { LABELED, STOP_WINDOW, TOUR, cvPath, parsePath, pathFor, stopIndex, tourEase, type Locale, type NodeId } from "./map-graph";
import { FALL_MS, FALL_SHORT_MS, FLIGHT_MS } from "./tokens";

export type Mode = "threshold" | "explore" | "cv";
export type Level = "map" | "node" | "sub";
export type Choice = "explore" | "cv";

export interface ExplorerState {
  readonly mode: Mode;
  readonly node: NodeId | null;
  readonly sub: string | null;
  readonly level: Level;
  /** La parada del tour más cercana (la URL y la sala). */
  readonly stop: number;
  /** El progreso continuo del tour, 0 … TOUR.length-1 (la cámara). */
  readonly tour: number;
  /** Cómo se llegó al nodo abierto: la cámara vuela distinto. */
  readonly via: "click" | "scroll";
  readonly hover: NodeId | null;
  readonly reduced: boolean;
  readonly portrait: boolean;
  /** Sube con cada entrada o salida por clic; la escena arranca el vuelo. */
  readonly flight: number;
  /** La caída en curso al elegir en el umbral o cambiar de modo. */
  readonly falling: Choice | null;
}

const STORAGE_KEY = "modo";

let locale: Locale = "en";
let state: ExplorerState = { mode: "cv", node: null, sub: null, level: "map", stop: 0, tour: 0, via: "scroll", hover: null, reduced: false, portrait: false, flight: 0, falling: null };
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
      tour: stopIndex(initial.node, initial.sub),
      via: "scroll",
      hover: null,
      reduced: false,
      portrait: false,
      flight: 0,
      falling: null,
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
   El tour: el scroll como progreso continuo
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

/** Del desplazamiento al avance lineal del tour (0 = mapa, 1 = primera parada…). */
function linearAt(scrollY: number): number {
  const h = heroHeight();
  if (scrollY <= h) return Math.max(0, scrollY / h);
  return Math.min(TOUR.length - 1, 1 + (scrollY - h) / stopHeight());
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
  if (state.hover) html.dataset.hover = state.hover;
  else delete html.dataset.hover;
  if (state.falling) html.dataset.falling = state.falling;
  else delete html.dataset.falling;

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

  // Con una sala abierta, lo que queda detrás no se puede enfocar; en el
  // umbral, las previsualizaciones tampoco.
  const inertBehind = state.mode === "explore" && state.level !== "map";
  for (const el of document.querySelectorAll<HTMLElement>(".core, .map-labels")) {
    if (inertBehind || state.mode === "threshold") el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }
  const main = document.querySelector<HTMLElement>("main.page");
  if (main) {
    if (state.mode === "threshold") main.setAttribute("inert", "");
    else main.removeAttribute("inert");
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
   Navegación dentro del mapa
   --------------------------------------------------------------------------- */

function pushUrl(node: NodeId | null, sub: string | null, replace: boolean) {
  const url = state.mode === "cv" ? cvPath(locale) : pathFor(locale, node, sub);
  if (window.location.pathname === url) return;
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
}

function focusRoom() {
  const title = document.querySelector<HTMLElement>(".room[data-active] .room-title");
  title?.focus({ preventScroll: true });
}

/**
 * La etiqueta del nodo viaja hasta convertirse en el nombre de la sala (y de
 * vuelta al salir): un fantasma de la etiqueta se anima de un rectángulo al
 * otro con transform y opacidad, sincronizado con el vuelo de la cámara.
 */
function morphLabel(node: NodeId, direction: "in" | "out") {
  if (state.reduced) return;
  const label = labelElement(node);
  const room = document.querySelector<HTMLElement>(`.room[data-node="${node}"]`);
  const kicker = room?.querySelector<HTMLElement>(".room-kicker");
  if (!label || !kicker || label.hasAttribute("data-offscreen")) return;
  const a = label.getBoundingClientRect();
  const b = kicker.getBoundingClientRect();
  if (a.width === 0 || b.width === 0) return;
  const ghost = label.cloneNode(true) as HTMLElement;
  ghost.className = "map-label map-label-ghost";
  ghost.removeAttribute("href");
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.transform = "none";
  ghost.style.left = `${a.left}px`;
  ghost.style.top = `${a.top}px`;
  ghost.style.width = `${a.width}px`;
  ghost.style.height = `${a.height}px`;
  document.body.appendChild(ghost);
  const dx = b.left - a.left;
  const dy = b.top - a.top;
  const sx = b.width / a.width;
  const sy = b.height / a.height;
  const from = { transform: "translate(0px, 0px) scale(1, 1)", opacity: 1 };
  const to = { transform: `translate(${dx}px, ${dy}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`, opacity: 0 };
  const duration = direction === "in" ? FLIGHT_MS * 0.6 : FLIGHT_MS * 0.4;
  const anim = ghost.animate(direction === "in" ? [from, { ...to, opacity: 0.85, offset: 0.7 }, to] : [to, { ...from, opacity: 0.85, offset: 0.6 }, { ...from, opacity: 0 }], {
    duration,
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    fill: "forwards",
  });
  anim.onfinish = () => ghost.remove();
  anim.oncancel = () => ghost.remove();
}

let leavingTimer = 0;
/**
 * La salida: la sala que se deja se queda un momento recogiéndose hacia su
 * nodo (65 % de la duración de la entrada) mientras la cámara se retira. El
 * CSS anima `data-leaving`; aquí sólo se marca y se apunta hacia dónde.
 */
function leaveRoom(node: NodeId) {
  const room = document.querySelector<HTMLElement>(`.room[data-node="${node}"]`);
  if (!room || state.reduced) return;
  const label = labelElement(node)?.getBoundingClientRect();
  const head = room.querySelector<HTMLElement>(".room-head")?.getBoundingClientRect();
  if (label && head) {
    room.style.setProperty("--collect-x", `${Math.round((label.left + label.width / 2 - (head.left + head.width / 2)) * 0.35)}px`);
    room.style.setProperty("--collect-y", `${Math.round((label.top - head.top) * 0.35)}px`);
  }
  for (const r of document.querySelectorAll<HTMLElement>(".room[data-leaving]")) r.removeAttribute("data-leaving");
  room.setAttribute("data-leaving", "");
  document.documentElement.dataset.leaving = "";
  window.clearTimeout(leavingTimer);
  leavingTimer = window.setTimeout(() => {
    room.removeAttribute("data-leaving");
    delete document.documentElement.dataset.leaving;
  }, FLIGHT_MS * 0.65 + 40);
}

function goTo(node: NodeId | null, sub: string | null, opts: { push?: boolean; replace?: boolean; scroll?: boolean; focus?: boolean; via?: "click" | "scroll" } = {}) {
  const { push = true, replace = false, scroll = true, focus = true, via = "click" } = opts;
  const target = node === "core" ? null : node;
  const stop = stopIndex(target, sub);
  const changed = target !== state.node || sub !== state.sub;
  if (push) pushUrl(target, sub, replace || !changed);
  if (changed && state.node && target !== state.node && state.mode === "explore") leaveRoom(state.node);
  if (changed && via === "click") {
    if (target && !state.node) morphLabel(target, "in");
    else if (!target && state.node) morphLabel(state.node, "out");
  }
  set({ node: target, sub, stop, via, tour: scroll ? stop : state.tour, flight: changed && via === "click" ? state.flight + 1 : state.flight });
  if (scroll && state.mode === "explore") scrollToStop(stop);
  if (focus && changed) {
    if (target) focusRoom();
    else if (node) labelElement(node)?.focus({ preventScroll: true });
  }
}

/** Entrar a un nodo o a un subnodo (clic, toque, Enter, enlace): pushState. */
export function enter(node: NodeId | null, sub: string | null = null) {
  goTo(node, sub, { via: "click" });
}

/** Salir un nivel: del subnodo al nodo, del nodo al mapa. */
export function exit() {
  if (state.level === "map") return;
  const leaving = state.node;
  if (state.level === "sub") {
    goTo(state.node, null, { via: "click" });
    return;
  }
  goTo(null, null, { focus: false, via: "click" });
  if (leaving) labelElement(leaving)?.focus({ preventScroll: true });
}

export function setHover(node: NodeId | null) {
  if (node === state.hover) return;
  set({ hover: node });
}

/* ---------------------------------------------------------------------------
   El umbral y el cambio de modo: la caída
   --------------------------------------------------------------------------- */

function remember(mode: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* sin almacenamiento, el modo dura la visita */
  }
}

/** Fotogramas de una transformación que crece hacia la pantalla con el punto de fuga fijo. */
function portalFrames(el: HTMLElement, origin: { x: number; y: number }, overshoot: boolean): Keyframe[] {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  const s0 = m.a || 1;
  const tx0 = m.e;
  const ty0 = m.f;
  const frames: Keyframe[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    // Curva con un rebote suave al final cuando se pide.
    const e = overshoot ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 4.2) : 1 - Math.pow(1 - k, 3);
    const s = s0 + (1 - s0) * e;
    // El punto bajo el clic no se mueve: la escala crece desde ahí.
    const tx = origin.x - (origin.x - tx0) * (s / s0);
    const ty = origin.y - (origin.y - ty0) * (s / s0);
    frames.push({ transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`, offset: k });
  }
  frames[frames.length - 1] = { transform: "none", offset: 1 };
  return frames;
}

function fallBackFrames(el: HTMLElement): Keyframe[] {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  const s0 = m.a || 1;
  return [
    { transform: `translate(${m.e}px, ${m.f}px) scale(${s0})`, opacity: 1 },
    { transform: `translate(${m.e}px, ${m.f + 40}px) scale(${(s0 * 0.84).toFixed(4)})`, opacity: 0 },
  ];
}

let fallTimer = 0;

/**
 * Elegir en el umbral. La previsualización elegida se vuelve un portal que
 * crece hacia la pantalla desde el punto del clic; la otra mitad cae hacia
 * atrás y se desvanece. Con movimiento reducido no hay caída: un fundido.
 */
export function choose(mode: Choice, origin: { x: number; y: number }) {
  if (state.mode !== "threshold" || state.falling) return;
  remember(mode);
  const main = document.querySelector<HTMLElement>("main.page");
  const stage = document.querySelector<HTMLElement>(".stage");
  const html = document.documentElement;
  html.style.setProperty("--fall-x", `${origin.x}px`);
  html.style.setProperty("--fall-y", `${origin.y}px`);
  set({ falling: mode, flight: state.flight + 1 });

  const duration = state.reduced ? 200 : FALL_MS;
  if (!state.reduced && main && stage) {
    const grow = mode === "cv" ? main : stage;
    const back = mode === "cv" ? stage : main;
    grow.animate(portalFrames(grow, origin, mode === "cv"), { duration, easing: "linear", fill: "forwards" });
    back.animate(fallBackFrames(back), { duration: duration * 0.55, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" });
  }
  window.clearTimeout(fallTimer);
  fallTimer = window.setTimeout(() => land(mode), duration);
}

function land(mode: Choice) {
  const main = document.querySelector<HTMLElement>("main.page");
  const stage = document.querySelector<HTMLElement>(".stage");
  for (const el of [main, stage]) el?.getAnimations().forEach((a) => a.cancel());
  const html = document.documentElement;
  html.dataset.arrive = mode;
  window.setTimeout(() => delete html.dataset.arrive, 1200);
  if (mode === "cv") {
    set({ mode: "cv", falling: null, node: null, sub: null, stop: 0, tour: 0 });
    window.history.replaceState(null, "", cvPath(locale));
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    document.querySelector<HTMLElement>(".mode-switch button[data-mode='cv']")?.focus({ preventScroll: true });
  } else {
    set({ mode: "explore", falling: null, node: null, sub: null, stop: 0, tour: 0 });
    window.history.replaceState(null, "", pathFor(locale));
    layoutTour();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    document.querySelector<HTMLElement>(".core h1")?.focus({ preventScroll: true });
  }
}

/** Sin WebGL: Modo CV sin caída y sin guardar nada, porque no fue una elección. */
export function fallbackToCv() {
  if (state.mode === "cv") return;
  set({ mode: "cv", falling: null, node: null, sub: null, stop: 0, tour: 0 });
  window.history.replaceState(null, "", cvPath(locale));
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

/** Cambiar de modo desde el interruptor: la misma caída, en corto. */
export function switchMode(mode: Choice) {
  if (state.mode === mode || state.falling) return;
  remember(mode);
  const main = document.querySelector<HTMLElement>("main.page");
  const stage = document.querySelector<HTMLElement>(".stage");
  const core = document.querySelector<HTMLElement>(".core");
  const html = document.documentElement;
  const duration = state.reduced ? 200 : FALL_SHORT_MS;
  const { node, sub } = state;
  html.dataset.switching = mode;
  window.setTimeout(() => delete html.dataset.switching, duration + 50);

  if (mode === "cv") {
    set({ mode: "cv", falling: null });
    window.history.replaceState(null, "", cvPath(locale));
    const room = node ? document.querySelector<HTMLElement>(`.room[data-node="${node}"]`) : null;
    if (room) room.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    if (!state.reduced && main && stage) {
      main.animate([{ transform: "scale(0.94)", opacity: 0 }, { transform: "scale(1.012)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }], { duration, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
      stage.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.08)", opacity: 0 }], { duration: duration * 0.8, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" });
    } else if (main) {
      main.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
    }
  } else {
    set({ mode: "explore", falling: null, node, sub, via: "click", flight: state.flight + 1 });
    window.history.replaceState(null, "", pathFor(locale, node, sub));
    layoutTour();
    scrollToStop(state.stop);
    if (!state.reduced && stage && core) {
      stage.getAnimations().forEach((a) => a.cancel());
      stage.animate([{ transform: "scale(0.94)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
      core.animate([{ transform: "scale(0.97)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration, delay: duration * 0.3, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" });
    } else if (stage) {
      stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
    }
  }
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
    const linear = linearAt(y);
    const tour = tourEase(linear);
    // El héroe se apaga conforme el tour arranca.
    document.documentElement.style.setProperty("--tour-t", Math.min(1, linear * 2).toFixed(3));
    const nearest = Math.round(tour);
    const inWindow = Math.abs(tour - nearest) <= STOP_WINDOW;
    if (inWindow && nearest !== state.stop) {
      const s = TOUR[nearest];
      goTo(s.node, s.sub, { replace: true, scroll: false, focus: false, via: "scroll" });
      set({ tour });
    } else if (inWindow && state.level === "map" && nearest > 0) {
      const s = TOUR[nearest];
      goTo(s.node, s.sub, { replace: true, scroll: false, focus: false, via: "scroll" });
      set({ tour });
    } else if (!inWindow && state.level !== "map" && state.via === "scroll") {
      // En tránsito entre paradas: la sala se recoge y el mapa vuelve.
      if (state.node) leaveRoom(state.node);
      set({ node: null, sub: null, tour });
    } else if (Math.abs(tour - state.tour) > 0.0005) {
      set({ tour });
    }
  });
}

function onPopState() {
  const parsed = parsePath(locale, window.location.pathname);
  if (!parsed) return;
  if (state.mode === "cv") return;
  goTo(parsed.node, parsed.sub, { push: false, via: "click" });
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
  if (!el?.classList.contains("map-label")) return;
  const order = LABELED;
  const current = order.indexOf(el.dataset.node as NodeId);
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
  if (state.mode === "explore" && state.via === "click") scrollToStop(state.stop);
}

// En el umbral, la previsualización del CV se desplaza sola, despacio, y se
// detiene al pasar el cursor.
let previewFrame = 0;
function previewScroll() {
  previewFrame = 0;
  if (state.mode !== "threshold") return;
  const main = document.querySelector<HTMLElement>("main.page");
  if (main && state.hover !== ("cv" as unknown as NodeId) && !state.reduced) {
    main.scrollTop += 0.4;
    if (main.scrollTop + main.clientHeight >= main.scrollHeight - 1) main.scrollTop = 0;
  }
  previewFrame = window.requestAnimationFrame(previewScroll);
}

/** Qué mitad del umbral tiene el cursor o el foco. */
export function setThresholdHover(side: Choice | null) {
  const html = document.documentElement;
  if (side) html.dataset.hover = side;
  else delete html.dataset.hover;
  // Se guarda como hover del almacén para que el desplazamiento se detenga.
  state = { ...state, hover: (side as unknown as NodeId) ?? null };
  emit();
}

/** Arranca el explorador. Lo llama <Explorer> al montar; devuelve la limpieza. */
export function initExplorer(loc: Locale, initial: { node: NodeId | null; sub: string | null }): () => void {
  locale = loc;
  const html = document.documentElement;
  const dataMode = html.dataset.mode;
  const mode: Mode = dataMode === "cv" ? "cv" : dataMode === "threshold" ? "threshold" : "explore";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portrait = window.innerWidth / window.innerHeight < 0.9;
  const fromUrl = parsePath(loc, window.location.pathname) ?? initial;
  const node = mode === "explore" && fromUrl.node !== "core" ? fromUrl.node : null;
  const sub = node ? fromUrl.sub : null;

  window.history.scrollRestoration = "manual";
  const stop = stopIndex(node, sub);
  state = { mode, node, sub, level: levelOf(node, sub), stop, tour: stop, via: "scroll", hover: null, reduced, portrait, flight: 0, falling: null };
  applyDom(null);
  layoutTour();
  if (mode === "explore") scrollToStop(stop);
  if (mode === "threshold") previewFrame = window.requestAnimationFrame(previewScroll);
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
    if (previewFrame) window.cancelAnimationFrame(previewFrame);
    window.clearTimeout(fallTimer);
    frame = 0;
    previewFrame = 0;
  };
}

export { FLIGHT_MS };
