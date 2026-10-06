#!/usr/bin/env node
/**
 * AshLanev2 headless playtest harness — ONE command, re-runnable on every build.
 *
 *   npm run playtest              # build the PWA, serve it, run the full flow
 *   npm run playtest -- --no-build  # reuse the last build in .output/public
 *   npm run playtest -- --url http://127.0.0.1:8080/AshLanev2/  # playtest a live server (dev/Pages), no build
 *
 * Flow: boot PWA -> menu -> fighter select -> "Throw down" (exhibit bout) ->
 * roam ("Cinder Ward") -> /ragdoll-demo (Rapier KO proof).
 * Captures screenshots + session video + console errors into
 * docs/playtest/<timestamp>/ and appends a dated section to
 * docs/playtest/PLAYTEST_REPORT.md.
 *
 * Pixel-diff between pre/post-action screenshots detects the "frozen canvas"
 * class of bug (sim alive, renderer dead). Screenshots go through CDP
 * Page.captureScreenshot because Playwright's screenshot waits forever on
 * pending webfonts.
 */
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { promises as fs, existsSync, mkdirSync, renameSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, ".output", "public");
const BASE_PATH = "/AshLanev2/";
const PORT = 8907;
const args = process.argv.slice(2);
const NO_BUILD = args.includes("--no-build");
const URL_FLAG = args.indexOf("--url");
const URL_ARG = URL_FLAG >= 0 ? args[URL_FLAG + 1] : undefined;

const ts = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};
const OUT = join(ROOT, "docs", "playtest", ts());
mkdirSync(OUT, { recursive: true });

const report = {
  timestamp: new Date().toISOString(),
  build: NO_BUILD ? "reused" : "fresh",
  steps: [],
  errors: [],
  failedRequests: [],
  diffs: {},
  ragdoll: null,
  verdict: "UNKNOWN",
};

const step = (name, ok, detail = "") => {
  report.steps.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

// ---------------------------------------------------------------- build+serve
// --url <base> overrides everything: playtest a live server (dev or Pages)
// instead of building. Useful when the box can't spare RAM for a full build.
let BASE;
let server = null; // assigned below when serving the build
if (URL_ARG) {
  BASE = URL_ARG.endsWith("/") ? URL_ARG : URL_ARG + "/";
  report.build = "skipped (--url)";
  console.log(`Targeting live server at ${BASE}`);
} else {
if (!NO_BUILD) {
  console.log("Building PWA (PAGES_BUILD=1)…");
  const b = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    shell: true,
    env: {
      ...process.env,
      PAGES_BUILD: "1",
      // This box OOM-kills uncapped vite builds (sibling agents hold ~6GB).
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --max-old-space-size=1536`.trim(),
    },
    encoding: "utf8",
  });
  if (b.status !== 0) {
    console.error(b.stdout?.slice(-2000), b.stderr?.slice(-2000));
    step("vite build", false, "build failed — see output above");
    process.exit(2);
  }
  step("vite build", true, ".output/public");
}
if (!existsSync(join(DIST, "index.html"))) {
  console.error(`No built PWA at ${DIST}. Run without --no-build first.`);
  process.exit(2);
}

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".wasm": "application/wasm",
  ".glb": "model/gltf-binary", ".hdr": "application/octet-stream",
  ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav",
  ".webmanifest": "application/manifest+json", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!urlPath.startsWith(BASE_PATH)) { res.statusCode = 404; res.end("nope"); return; }
    let rel = urlPath.slice(BASE_PATH.length) || "index.html";
    let file = join(DIST, rel);
    if (!existsSync(file)) file = join(DIST, "index.html"); // SPA fallback
    if (existsSync(file) && (await fs.stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await fs.readFile(file);
    res.setHeader("content-type", MIME[extname(file)] || "application/octet-stream");
    res.end(body);
  } catch (e) {
    res.statusCode = 500; res.end(String(e));
  }
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
BASE = `http://127.0.0.1:${PORT}${BASE_PATH}`;
console.log(`Serving built PWA at ${BASE}`);
} // end else (not --url)

// ---------------------------------------------------------- minimal PNG diff
function decodePng(buf) {
  let off = 8;
  let w = 0, h = 0, ctype = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    if (type === "IHDR") {
      w = buf.readUInt32BE(off + 8); h = buf.readUInt32BE(off + 12); ctype = buf[off + 17];
    } else if (type === "IDAT") {
      idat.push(buf.subarray(off + 8, off + 8 + len));
    } else if (type === "IEND") break;
    off += 12 + len;
  }
  // colorType 2 = RGB, 6 = RGBA. Normalize to RGBA.
  const ch = ctype === 6 ? 4 : ctype === 2 ? 3 : 0;
  if (!ch) throw new Error("unsupported PNG colorType " + ctype);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const data = Buffer.alloc(h * w * 4);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++];
    const row = raw.subarray(p, p + stride); p += stride;
    const prev = y ? raw.subarray(p - stride * 2 - 1, p - stride - 1) : null;
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 4; c++) {
        const i = x * ch + c;
        const src = c < ch ? row[i] : 255;
        const a = x > 0 ? data[(y * w + x - 1) * 4 + c] : 0;
        const b = prev ? prev[i] : 0;
        const cc = x > 0 && prev ? prev[i - ch] : 0;
        let v = src;
        if (f === 1) v = (v + a) & 255;
        else if (f === 2) v = (v + b) & 255;
        else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
        else if (f === 4) {
          const pa = Math.abs(b - cc), pb = Math.abs(a - cc), pc = Math.abs(a + b - 2 * cc);
          v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : cc)) & 255;
        }
        data[(y * w + x) * 4 + c] = v;
      }
    }
  }
  return { w, h, data };
}

function pixelDiff(aBuf, bBuf) {
  const a = decodePng(aBuf), b = decodePng(bBuf);
  if (a.w !== b.w || a.h !== b.h) return { changed: -1, pct: -1, note: "size mismatch" };
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (Math.abs(a.data[i] - b.data[i]) > 10 || Math.abs(a.data[i + 1] - b.data[i + 1]) > 10 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 10) changed++;
  }
  return { changed, pct: +(100 * changed / (a.w * a.h)).toFixed(2) };
}

// ------------------------------------------------------------------- browser
const browser = await chromium.launch({ args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true,
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);

page.on("pageerror", (e) => report.errors.push("PAGEERROR: " + String(e.message || e).slice(0, 300)));
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const t = m.text();
  // Sandbox proxy blocks Google Fonts / some CDNs — ERR_TUNNEL is always
  // environmental noise, never an app bug.
  if (/ERR_TUNNEL/.test(t)) return;
  if (/fonts\.(googleapis|gstatic)\.com/.test(m.location?.url || "")) return;
  report.errors.push("CONSOLE: " + t.slice(0, 300));
});
page.on("requestfailed", (r) => {
  if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) return; // environmental
  report.failedRequests.push(`${r.method()} ${r.url().slice(0, 120)} :: ${r.failure()?.errorText}`);
});

async function shot(name) {
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
  const buf = Buffer.from(data, "base64");
  await fs.writeFile(join(OUT, name), buf);
  return buf;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickButton(names) {
  // names: preferred label first, legacy fallbacks after (old builds rename buttons).
  // Document-level dispatch: Playwright's locator actionability checks hang on
  // this game's perpetually-animating menu (element never "stable"), so we
  // find + scroll + click inside one evaluate and never hold an element handle.
  for (const name of Array.isArray(names) ? names : [names]) {
    const hit = await page.evaluate((label) => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((x) => (x.textContent || "").toLowerCase().includes(label.toLowerCase()));
      if (!b || b.disabled) return null;
      try { b.scrollIntoView({ block: "center" }); } catch {}
      b.click();
      return (b.textContent || "").trim().slice(0, 40);
    }, name).catch(() => null);
    if (hit) { await sleep(400); return name; }
  }
  return null;
}

try {
  // 1 — boot + menu
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(9000);
  await shot("01-menu.png");
  step("boot: menu renders", report.errors.length === 0, `${report.errors.length} js errors`);

  // 2 — fighter select
  const openedFighters = await clickButton(["Fighters"]);
  await sleep(2000);
  await shot("02-fighter-select.png");
  step("menu -> fighter select", openedFighters);

  // pick the first fighter card (stat bars POW/SPD/TGH mark the cards)
  const picked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const card = btns.find((x) => /POW|SPD|TGH/i.test(x.textContent || ""));
    if (!card || card.disabled) return null;
    try { card.scrollIntoView({ block: "center" }); } catch {}
    card.click();
    return (card.textContent || "").trim().slice(0, 40);
  }).catch(() => null);
  await sleep(1500);
  await shot("02b-fighter-picked.png");
  step("fighter select -> pick fighter", !!picked, picked || "no card found");

  // 3 — Throw down (exhibit bout)
  const threwDown = await clickButton(["Throw down", "EXHIBITION", "Exhibition"]);
  await sleep(5000);
  const s3 = await shot("03-combat-start.png");
  for (const k of ["j", "j", "k", "l", "j"]) { await page.keyboard.press(k); await sleep(350); }
  await sleep(1200);
  const s4 = await shot("04-combat-action.png");
  const d1 = pixelDiff(s3, s4);
  report.diffs.combat = d1;
  step("combat: canvas animates on input", d1.changed > 500,
    `${d1.changed} px changed (${d1.pct}%)${d1.changed <= 500 ? " — FROZEN CANVAS BUG?" : ""} (threwDown clicked: ${threwDown})`);

  // 4 — roam: Cinder Ward
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(8000);
  const roamed = await clickButton(["Cinder Ward", "Walk the ward"]);
  await sleep(4000);
  const s5 = await shot("05-roam-start.png");
  for (const k of ["w", "a", "s", "d", "j", "k", " "]) { await page.keyboard.press(k); await sleep(300); }
  await sleep(1000);
  const s6 = await shot("06-roam-action.png");
  const d2 = pixelDiff(s5, s6);
  report.diffs.roam = d2;
  step("roam: canvas animates on input", d2.changed > 500,
    `${d2.changed} px changed (${d2.pct}%) (roam clicked: ${roamed})`);

  // 5 — ragdoll KO demo (Rapier proof, in-game)
  // Hard timeout: if the route isn't in this build (stale PWA), record and move on.
  let ragdollOk = false, displaced = 0, rerr = "";
  try {
    await page.goto(BASE + "ragdoll-demo", { waitUntil: "domcontentloaded", timeout: 30000 });
    const deadline = Date.now() + 45000;
    let sawHook = false;
    while (Date.now() < deadline) {
      await sleep(1000);
      const st = await page.evaluate(() => window.__ragdollDemo || null).catch(() => null);
      if (st) sawHook = true;
      if (st && (st.status === "settled" || st.status === "ko")) {
        displaced = st.displaced || 0; ragdollOk = displaced > 2.0; rerr = st.error || "";
        break;
      }
      if (st && st.status === "error") { rerr = st.error || "unknown"; break; }
    }
    if (!sawHook) rerr = "route /ragdoll-demo not in this build (stale PWA?) — rebuild to include it";
  } catch (e) {
    rerr = "ragdoll-demo nav failed: " + String(e && e.message || e).slice(0, 120);
  }
  await shot("07-ragdoll-ko.png");
  report.ragdoll = { ok: ragdollOk, displaced: +displaced.toFixed(2), error: rerr };
  step("ragdoll-demo: fighter KO'd with Rapier ragdoll", ragdollOk,
    `displaced=${displaced.toFixed(2)}${rerr ? " err=" + rerr : ""}`);
} catch (e) {
  report.errors.push("HARNESS: " + String(e && e.message || e).slice(0, 300));
  step("harness completed", false, String(e && e.message || e).slice(0, 120));
}

const videoPath = await page.video()?.path().catch(() => null);
await ctx.close();
await browser.close();
if (videoPath && existsSync(videoPath)) renameSync(videoPath, join(OUT, "playtest.webm"));

const hardFails = report.steps.filter((s) => !s.ok).length;
report.verdict = hardFails === 0 && report.errors.length === 0 ? "PASS"
  : hardFails === 0 ? "PASS_WITH_JS_ERRORS" : "FAIL";
await fs.writeFile(join(OUT, "report.json"), JSON.stringify(report, null, 2));

// append dated section to the standing playtest report
const mdPath = join(ROOT, "docs", "playtest", "PLAYTEST_REPORT.md");
const section = [
  `## ${report.timestamp.slice(0, 10)} — automated harness run (${OUT.split("/").pop()})`,
  ``,
  `**Verdict:** ${report.verdict} — ${report.steps.filter((s) => s.ok).length}/${report.steps.length} steps passed, ` +
    `${report.errors.length} JS errors, ${report.failedRequests.length} failed requests.`,
  ``,
  `| Step | Result | Detail |`,
  `|---|---|---|`,
  ...report.steps.map((s) => `| ${s.name} | ${s.ok ? "PASS" : "FAIL"} | ${s.detail} |`),
  ``,
  `- Combat pixel-diff: ${JSON.stringify(report.diffs.combat)}`,
  `- Roam pixel-diff: ${JSON.stringify(report.diffs.roam)}`,
  `- Ragdoll KO proof: ${JSON.stringify(report.ragdoll)}`,
  report.errors.length ? `- JS errors:\n${report.errors.map((e) => `  - ${e}`).join("\n")}` : `- JS errors: none`,
  report.failedRequests.length ? `- Failed requests:\n${report.failedRequests.slice(0, 10).map((e) => `  - ${e}`).join("\n")}` : `- Failed requests: none`,
  ``,
  `Captures: \`docs/playtest/${OUT.split("/").pop()}/\` (01-menu … 07-ragdoll-ko.png + playtest.webm)`,
  ``,
].join("\n");
await fs.appendFile(mdPath, section + "\n");

if (server) server.close();
console.log(`\nDone. Captures + report.json in ${OUT}`);
console.log(`Verdict: ${report.verdict}`);
process.exit(report.verdict === "FAIL" ? 1 : 0);
