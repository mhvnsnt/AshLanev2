// Single-shot runner: fresh browser per shot (SwiftShader stability).
// Usage: SHOT="09-projects-contested" node shoot-one.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const SHOTS_DIR = path.join(__dirname, "..", "..", "..", "docs", "city-shots");
const SERVE_DIR = __dirname;
const THREE_DIR = "/home/hatch/work/city/AshLanev2/node_modules/three";

const EXPRS = {
  "04-civic-day": `__city.lookAtDistrict("civic","street")`,
  "06-industrial-day": `__city.lookAtDistrict("industrial","aerial")`,
  "07-waterfront-fog": `__city.lookAtDistrict("waterfront","street")`,
  "09-projects-contested": `__city.forceContest("projects");__city.lookAtDistrict("projects","street")`,
  "10-projects-captured-by-player": `__city.forceTurfFlip("projects");__city.lookAtDistrict("projects","street")`,
  "11-outskirts-day": `__city.lookAtDistrict("outskirts","wide")`,
  "12-suburbs-day": `__city.lookAtDistrict("suburbs","street")`,
};

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

async function main() {
  const name = process.env.SHOT;
  const expr = EXPRS[name];
  if (!expr) { console.error("unknown shot", name); process.exit(1); }
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  await new Promise(r => server.listen(8933, r));
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader",
           "--enable-unsafe-swiftshader", "--disable-gpu-sandbox", "--window-size=1280,720"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on("pageerror", e => console.log("PAGE EXC:", e.message.slice(0, 200)));
  await page.goto("http://localhost:8933/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction("window.__cityReady === true", { timeout: 240000 });
  await page.evaluate(expr);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SHOTS_DIR, name + ".png") });
  console.log("shot:", name);
  await browser.close();
  server.close();
}

main().catch(e => { console.error(e.message.slice(0, 300)); process.exit(1); });
