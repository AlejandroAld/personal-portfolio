import { chromium } from "playwright-core";

if (!process.env.CHROME_PATH) {
  throw new Error("Define CHROME_PATH con la ruta a un binario de Chrome o Chromium.");
}
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
await p.locator("#agent").scrollIntoViewIfNeeded();
await p.getByRole("button", { name: /Start the conversation/i }).click();
await p.waitForSelector('[role="log"]');
await p.getByRole("button", { name: "What can't you do?" }).click();
await p.waitForTimeout(3000);
// Segundo turno escrito a mano.
await p.fill("#agent-input", "And what about evaluation?");
await p.getByRole("button", { name: "Send", exact: true }).click();
await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate(() => ({
  turns: document.querySelectorAll('[role="log"] > div').length,
  hasReset: !![...document.querySelectorAll("button")].some(x => /Start over/i.test(x.textContent||"")),
}))));
await b.close();
