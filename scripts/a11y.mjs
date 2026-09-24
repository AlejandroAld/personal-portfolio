// axe-core contra la página construida: dos idiomas, diez estados cada uno.
//
//   npm run build && npm run start      (en otra terminal)
//   npm run a11y                        (A11Y_URL para otro origen)
//
// En local hace falta un Chromium para playwright-core: `npx playwright install
// chromium`, o CHROME_PATH apuntando a uno ya instalado. Sale con 1 si hay una
// sola violación WCAG; las de "best-practice" se listan pero no bloquean.
import { chromium } from "playwright-core";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.A11Y_URL ?? "http://localhost:3100";
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--no-sandbox"],
});

const sweep = (page) =>
  page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });

const STATES = [
  { name: "móvil, inicial", viewport: { width: 390, height: 844 }, setup: sweep },
  {
    name: "móvil, menú abierto",
    viewport: { width: 390, height: 844 },
    setup: async (p) => {
      await p.locator("header button[aria-controls='mobile-nav']").click();
      await p.waitForSelector("#mobile-nav");
    },
  },
  {
    name: "escritorio, umbral",
    viewport: { width: 1280, height: 900 },
    threshold: true,
    setup: async (p) => {
      await p.waitForFunction(() => document.querySelector(".stage-canvas canvas"), null, { timeout: 10000 }).catch(() => {});
      await p.locator(".th-option-explore").hover();
    },
  },
  {
    name: "móvil, umbral",
    viewport: { width: 390, height: 844 },
    threshold: true,
    setup: async (p) => {
      await p.waitForTimeout(600);
    },
  },
  {
    name: "escritorio, mapa",
    viewport: { width: 1280, height: 900 },
    setup: async (p) => {
      await p.waitForFunction(() => document.querySelector(".stage-canvas canvas"), null, { timeout: 10000 }).catch(() => {});
    },
  },
  {
    name: "escritorio, sala abierta (Memory)",
    viewport: { width: 1280, height: 900 },
    setup: async (p) => {
      await p.locator('.map-label[data-node="memory"]').click();
      await p.waitForTimeout(1200);
    },
  },
  {
    name: "escritorio, subnodo (Dalton)",
    viewport: { width: 1280, height: 900 },
    setup: async (p) => {
      await p.locator('.map-label[data-node="memory"]').click();
      await p.waitForTimeout(1200);
      await p.locator(".room[data-active] .subnode-link").first().click();
      await p.waitForTimeout(1500);
      await p.locator(".room[data-active] .card-hover, .room[data-active] .tag").first().hover().catch(() => {});
    },
  },
  {
    name: "móvil, sala abierta",
    viewport: { width: 390, height: 844 },
    setup: async (p) => {
      await p.locator('.map-label[data-node="outputs"]').click();
      await p.waitForTimeout(1200);
    },
  },
  {
    name: "escritorio, Modo CV",
    viewport: { width: 1280, height: 900 },
    setup: async (p) => {
      await p.locator('.mode-switch-nav button[data-mode="cv"]').click();
      await p.waitForTimeout(400);
      await sweep(p);
    },
  },
  { name: "escritorio, movimiento reducido", viewport: { width: 1280, height: 900 }, setup: sweep, reducedMotion: "reduce" },
];

let wcagViolations = 0;
const rows = [];

for (const lang of ["en", "es"]) {
  for (const state of STATES) {
    const mobile = state.viewport.width < 700;
    const ctx = await browser.newContext({
      viewport: state.viewport,
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: state.reducedMotion,
    });
    const page = await ctx.newPage();
    // La primera visita muestra el umbral; los demás estados parten del mapa.
    if (!state.threshold) await page.addInitScript(() => localStorage.setItem("modo", "explore"));
    await page.goto(`${BASE}/${lang}`, { waitUntil: "networkidle" });
    await state.setup(page);
    await page.waitForTimeout(800);

    const wcag = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const bp = await new AxeBuilder({ page }).withTags(["best-practice"]).analyze();
    wcagViolations += wcag.violations.length;

    const label = `[${lang}] ${state.name}`;
    rows.push({ label, wcag, bp });
    console.log(
      `${wcag.violations.length === 0 ? "✓" : "✗"} ${label.padEnd(38)} ` +
        `WCAG: ${wcag.violations.length} violaciones · ${wcag.passes.length} reglas pasan · ` +
        `${wcag.incomplete.length} por revisar · ${wcag.inapplicable.length} no aplican | ` +
        `best-practice: ${bp.violations.length} · ${bp.passes.length} pasan`,
    );
    for (const v of [...wcag.violations, ...bp.violations]) {
      console.log(`    ✗ ${v.id} (${v.impact}, ${v.nodes.length} nodos): ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`        ${n.html.replace(/\s+/g, " ").slice(0, 110)}`);
    }
    for (const inc of wcag.incomplete) {
      console.log(`    ? ${inc.id} (${inc.nodes.length} nodos por revisar a mano): ${inc.help}`);
      // Por qué axe no pudo decidir: casi siempre un fondo que no es un color
      // plano (el canvas del héroe) o un elemento que otro tapa en ese momento.
      const reasons = new Map();
      for (const n of inc.nodes) {
        const why = [...n.any, ...n.all, ...n.none].map((c) => c.message).filter(Boolean).join(" / ") || "sin motivo";
        reasons.set(why, [...(reasons.get(why) ?? []), n.html.replace(/\s+/g, " ").slice(0, 80)]);
      }
      for (const [why, nodes] of reasons) {
        console.log(`        ${nodes.length}× ${why}`);
        for (const h of nodes.slice(0, 4)) console.log(`            ${h}`);
      }
    }
    await ctx.close();
  }
}

// Qué reglas WCAG pasaron, una vez: es la misma lista en todos los estados.
const passed = [...new Set(rows.flatMap((r) => r.wcag.passes.map((p) => p.id)))].sort();
console.log(`\nReglas WCAG que pasan en algún estado (${passed.length}): ${passed.join(", ")}`);
console.log(`\n=== axe-core ${rows[0].wcag.testEngine.version} — violaciones WCAG 2.x A/AA: ${wcagViolations} ===`);
await browser.close();
process.exit(wcagViolations === 0 ? 0 : 1);
