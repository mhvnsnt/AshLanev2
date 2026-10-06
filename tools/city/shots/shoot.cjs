// City multi-angle screenshot driver (puppeteer + SwiftShader).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const SHOTS_DIR = path.join(__dirname, "entry.ts", "..", "..", "..", "..", "docs", "city-shots");
const SERVE_DIR = __dirname;

const THREE_DIR = "/home/hatch/work/city/AshLanev2/node_modules/three";

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath, ct = "text/javascript";
  if (urlPath === "/" || urlPath === "/index.html") { filePath = path.join(SERVE_DIR, "page.html"); ct = "text/html"; }
  else if (urlPath === "/entry.js") filePath = path.join(SERVE_DIR, "entry.js");
  else if (urlPath.startsWith("/three/")) {
    filePath = path.join(THREE_DIR, urlPath.slice(7));
    if (!filePath.startsWith(THREE_DIR)) { res.writeHead(403); res.end("no"); return; }
  }
  else { res.writeHead(404); res.end("nf"); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "Content-Type": ct });
    res.end(data);
  });
});

const SHOTS = [
  // [name, js expression run in page context, needsReload]
  ["01-neon-district-aerial", `__city.lookAtDistrict("neon-district","aerial")`],
  ["02-neon-district-street", `__city.lookAtDistrict("neon-district","street")`],
  ["03-marquee-mile-street", `__city.lookAtDistrict("marquee-mile","street")`],
  ["04-civic-day", `__city.lookAtDistrict("civic","street")`],
  ["05-projects-dusk", `__city.lookAtDistrict("projects","street")`],
  ["06-industrial-day", `__city.lookAtDistrict("industrial","aerial")`],
  ["07-waterfront-fog", `__city.lookAtDistrict("waterfront","street")`],
  ["08-underground-station", `__city.lookUnderground()`],
  ["09-projects-contested", `__city.forceContest("projects");__city.lookAtDistrict("projects","street")`, true],
  ["10-projects-captured-by-player", `__city.forceTurfFlip("projects");__city.lookAtDistrict("projects","street")`, true],
  ["11-outskirts-day", `__city.lookAtDistrict("outskirts","wide")`],
  ["12-suburbs-day", `__city.lookAtDistrict("suburbs","street")`],
];

async function main() {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  await new Promise(r => server.listen(8932, r));
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader",
           "--enable-unsafe-swiftshader", "--disable-gpu-sandbox", "--window-size=1280,720"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on("console", m => { if (m.type() === "error") console.log("PAGE ERROR:", m.text()); });
  page.on("pageerror", e => console.log("PAGE EXC:", e.message));
  await page.goto("http://localhost:8932/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction("window.__cityReady === true", { timeout: 120000 });

  for (const [name, expr, needsReload] of SHOTS) {
    if (needsReload || name.includes("aerial") || name.includes("wide")) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForFunction("window.__cityReady === true", { timeout: 180000 });
    }
    await page.evaluate(expr);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SHOTS_DIR, name + ".png") });
    console.log("shot:", name);
  }
  await browser.close();
  server.close();
}

main().catch(e => { console.error(e); process.exit(1); });
