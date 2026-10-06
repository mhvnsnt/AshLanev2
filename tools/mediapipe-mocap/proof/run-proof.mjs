/**
 * run-proof.mjs — headless visual proof of the MediaPipe mocap pipeline.
 *
 * Serves the proof page + repo assets, drives the synthetic punch clip
 * through the REAL pipeline code (landmarks -> joint deltas -> rig), and
 * screenshots Bill Dozer at key moments.
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dir, "../../..");

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".glb": "model/gltf-binary", ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath;
  if (urlPath.startsWith("/node_modules/")) {
    filePath = path.join(REPO, urlPath.slice(1));
  } else if (urlPath.startsWith("/models/")) {
    filePath = path.join(REPO, "public/models/cast", urlPath.slice(8));
  } else if (urlPath === "/" || urlPath === "/proof-page.html") {
    filePath = path.join(__dir, "proof-page.html");
  } else if (urlPath === "/mediapipe-mocap.js") {
    filePath = path.join(__dir, "mediapipe-mocap.js");
  } else {
    res.writeHead(404); res.end("not found"); return;
  }
  if (!filePath.startsWith(REPO) && !filePath.startsWith(__dir)) {
    res.writeHead(403); res.end("forbidden"); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found: " + urlPath); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

await new Promise((r) => server.listen(8935, r));

const browser = await puppeteer.launch({
  headless: "shell",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 960 });
page.on("console", (m) => { if (m.type() === "error") console.log("PAGE ERROR:", m.text().slice(0, 200)); });
page.on("pageerror", (e) => console.log("PAGE EXC:", String(e).slice(0, 200)));

await page.goto("http://127.0.0.1:8935/proof-page.html?model=/models/CAIN_ELIAS_gear.glb", { waitUntil: "networkidle0", timeout: 90000 });
await page.waitForFunction("window.__ready === true", { timeout: 90000 });

const shotsDir = path.join(__dir, "proof-shots");
fs.mkdirSync(shotsDir, { recursive: true });

// Key moments of the 2s punch: rest, windup, extension, hold, return
const moments = [
  ["00-rest", 0.0],
  ["01-windup", 0.35],
  ["02-extension", 0.7],
  ["03-hold", 0.9],
  ["04-return", 1.5],
  ["05-rest2", 1.95],
];
for (const [name, t] of moments) {
  await page.evaluate((tt) => window.__setTime(tt), t);
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: path.join(shotsDir, `${name}.png`) });
  console.log("shot", name);
}

await browser.close();
server.close();
console.log("done ->", shotsDir);
