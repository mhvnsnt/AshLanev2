const { chromium } = require("playwright-core");

const URL = "http://127.0.0.1:8091/AshLanev2/";

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 150)));
  console.log("goto...");
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  console.log("waiting for button...");
  await page.getByRole("button", { name: "Cinder Ward" }).first().waitFor({ timeout: 45000 });
  console.log("button found");
  await page.getByRole("button", { name: "Cinder Ward" }).first().click();
  console.log("clicked");
  for (const [label, wait] of [["2s", 2000], ["6s", 4000], ["16s", 10000]]) {
    await page.waitForTimeout(wait);
    const vis = await page.evaluate("!!document.querySelector('.al-vs-splash')");
    console.log(`splash at ${label}:`, vis);
  }
  console.log("errors:", errs.slice(0, 6));
  await browser.close();
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
