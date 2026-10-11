// Render GLB shots via headless Chromium (node playwright). Usage: node verify_shots.mjs <glb> <outdir>
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const glbSrc = path.resolve(process.argv[2]);
const outdir = path.resolve(process.argv[3]);
fs.mkdirSync(outdir, { recursive: true });
const root = '/home/hatch/workspace/game-sweep/AshLanev2';

const server = http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (req.url.startsWith('/_charfix_viewer.html')) p = '/home/hatch/workspace/game-sweep/AshLanev2/_charfix_viewer.html';
  if (req.url.startsWith('/_charfix_tmp.glb')) p = glbSrc;
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(p);
    const ct = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});
await new Promise(r => server.listen(8931, '127.0.0.1', r));

const browser = await chromium.launch();
for (const pose of ['tpose', 'armsup', 'punch']) {
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await page.goto(`http://127.0.0.1:8931/_charfix_viewer.html?model=/_charfix_tmp.glb&pose=${pose}&side=front`);
  try {
    await page.waitForFunction(`document.title==='READY'||document.title.startsWith('ERROR')`, { timeout: 30000 });
    const title = await page.title();
    if (title.startsWith('ERROR')) console.log(pose + ': ' + title);
    else { await page.waitForTimeout(800); await page.screenshot({ path: path.join(outdir, pose + '.png') }); console.log(pose + ': shot saved'); }
  } catch (e) { console.log(pose + ': TIMEOUT ' + e.message.slice(0, 120)); }
  await page.close();
}
await browser.close();
server.close();
console.log('done');
