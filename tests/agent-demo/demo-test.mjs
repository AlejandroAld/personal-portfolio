import { chromium } from "playwright-core";

if (!process.env.CHROME_PATH) {
  throw new Error("Define CHROME_PATH con la ruta a un binario de Chrome o Chromium.");
}

const URL = process.argv[2];
const EXPECT = process.argv[3]; // "stream" | "rate_limit" | "error"

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.locator("#agent").scrollIntoViewIfNeeded();

// Abrir el chat: comprueba también que la carga diferida entrega el chunk.
await page.getByRole("button", { name: /Start the conversation/i }).click();
await page.waitForSelector('[role="log"]', { timeout: 10000 });

const chunkLoaded = true;

// Lanzar una pregunta sugerida.
await page.getByRole("button", { name: "What can't you do?" }).click();
await page.waitForTimeout(3500);

const result = await page.evaluate(() => {
  const log = document.querySelector('[role="log"]');
  const alert = document.querySelector('[role="alert"]');
  return {
    ariaLive: log?.getAttribute("aria-live"),
    text: (log?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 240),
    alertText: (alert?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
    hasResetButton: !![...document.querySelectorAll("button")].find((b) => /Start over/i.test(b.textContent || "")),
    inputDisabled: document.querySelector("#agent-input")?.disabled,
  };
});

const checks = {
  chunkLoaded,
  ariaLivePolite: result.ariaLive === "polite",
  noPageErrors: errors.length === 0,
  streamedAnswer: /I haven't written \.NET/.test(result.text),
  showsRateLimit: /hourly limit/i.test(result.alertText),
  showsError: /couldn't answer/i.test(result.alertText),
  inputReenabled: result.inputDisabled === false,
};

const pass =
  EXPECT === "stream"
    ? checks.streamedAnswer && checks.noPageErrors && checks.ariaLivePolite && checks.inputReenabled
    : EXPECT === "rate_limit"
      ? checks.showsRateLimit && checks.noPageErrors
      : checks.showsError && checks.noPageErrors;

console.log(JSON.stringify({ expect: EXPECT, pass, checks, sample: result.text, alert: result.alertText, errors }, null, 2));
await browser.close();
process.exit(pass ? 0 : 1);
