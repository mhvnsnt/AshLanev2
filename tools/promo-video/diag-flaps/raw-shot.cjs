const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const HERE = '/home/hatch/workspace/game-sweep/AshLanev2/tools/promo-video/diag-flaps';
const NM = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODEL_FILE = process.env.SB_MODEL_FILE; // absolute path to glb
const OUT = process.env.SB_OUT; // absolute output png
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let f;
  if (u === '/') f = path.join(HERE, 'raw-bannon.html');
  else if (u === '/model.glb') f = MODEL_FILE;
  else if (u.startsWith('/node_modules/')) f = path.join(NM, u.slice(14));
  else { res.writeHead(404); res.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(f);
    const mt = ext==='.js'?'text/javascript':ext==='.glb'?'model/gltf-binary':ext==='.wasm'?'application/wasm':'text/html';
    res.writeHead(200, {'Content-Type': mt}); res.end(d); });
});
server.listen(0, async () => {
  const port = server.address().port;
  const browser = await puppeteer.launch({headless:'shell', args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--force-device-scale-factor=1']});
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0,200)));
  await page.setViewport({width:640,height:640});
  await page.goto('http://127.0.0.1:'+port+'/', {waitUntil:'networkidle0', timeout:60000});
  try { await page.waitForFunction('window.__done===true', {timeout:60000}); }
  catch(e) { console.log('TIMEOUT waiting for render'); }
  await new Promise(r=>setTimeout(r,500));
  await page.screenshot({path:OUT});
  console.log('wrote', OUT);
  await browser.close(); server.close();
});
