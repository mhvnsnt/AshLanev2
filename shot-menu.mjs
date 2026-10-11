import { chromium } from "playwright-core";

const shots = process.argv[2] || "/tmp/shots";
const { mkdirSync } = await import("fs");
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 200)); });

await page.goto("http://127.0.0.1:8080/AshLanev2/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: `${shots}/menu-main.png` });

// click Fighters chip
const fighters = page.getByRole("button", { name: "Fighters" });
if (await fighters.count()) {
  await fighters.first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${shots}/menu-fighters.png`, fullPage: false });
  // scroll the sheet to show cards
  await page.evaluate(() => { document.querySelector(".sheet")?.scrollTo(0, 900); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shots}/menu-fighters-cards.png` });
}

// click Jobs chip (back to main first via Back buttons)
await page.goto("http://127.0.0.1:8080/AshLanev2/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);
const jobs = page.getByRole("button", { name: "Jobs" });
if (await jobs.count()) {
  await jobs.first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/menu-jobs.png` });
}

console.log("ERRORS:", errors.length ? errors.slice(0, 10) : "none");
await browser.close();
