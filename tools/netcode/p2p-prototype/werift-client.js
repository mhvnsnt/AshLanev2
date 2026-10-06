// Node-side validation (client): sends 60 ticks of fake player positions over
// a real WebRTC data channel and measures per-tick round-trip time.
// Pairs with werift-host.js via ./signal/*.json. See werift-host.js header.
// Run:  node werift-host.js    (terminal 1, first)
//       node werift-client.js  (terminal 2)
const fs = require('fs');
const path = require('path');
const { RTCPeerConnection, RTCSessionDescription } = require('werift');

const SIG = path.join(__dirname, 'signal');
const TICKS = 60;
const TICK_MS = 1000 / 60;

function waitFor(cond, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let v = false;
      try { v = cond(); } catch (e) { /* not ready */ }
      if (v) { clearInterval(iv); resolve(); }
      else if (Date.now() - t0 > timeoutMs) { clearInterval(iv); reject(new Error('timeout: ' + label)); }
    }, 200);
  });
}

(async () => {
  console.log('[client] waiting for offer...');
  await waitFor(() => fs.existsSync(path.join(SIG, 'offer.json')), 60000, 'offer file');

  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  const openP = new Promise((res) => {
    pc.onDataChannel.subscribe((dc) => {
      dc.addEventListener('open', () => res(dc), { once: true });
    });
  });

  const offer = JSON.parse(fs.readFileSync(path.join(SIG, 'offer.json'), 'utf8'));
  await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp, offer.type));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitFor(() => pc.iceGatheringState === 'complete', 20000, 'client ICE gathering');
  fs.writeFileSync(path.join(SIG, 'answer.json'), JSON.stringify(pc.localDescription));
  console.log('[client] answer written, waiting for data channel...');

  const dc = await Promise.race([
    openP,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout: data channel open')), 30000)),
  ]);
  console.log('[client] data channel OPEN — starting 60-tick sync');

  const rtts = [];
  const sendTimes = new Map();
  let sent = 0, received = 0, x = 100, y = 200;

  dc.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === 'echo') {
      rtts.push(performance.now() - sendTimes.get(msg.tick));
      if (++received >= TICKS) {
        const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
        const sorted = [...rtts].sort((a, b) => a - b);
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        console.log(`[client] DONE: ${received}/${TICKS} echoes`);
        console.log(`[client] RTT avg=${avg.toFixed(2)}ms  min=${sorted[0].toFixed(2)}ms  p95=${p95.toFixed(2)}ms  max=${sorted[sorted.length - 1].toFixed(2)}ms`);
        try { fs.rmSync(SIG, { recursive: true, force: true }); } catch (e) {}
        pc.close();
        process.exit(0);
      }
    }
  });

  const timer = setInterval(() => {
    if (sent >= TICKS) { clearInterval(timer); return; }
    x += 0.5; y += 0.25; // fake local player motion
    sendTimes.set(sent, performance.now());
    dc.send(JSON.stringify({ type: 'tick', tick: sent, x, y }));
    sent++;
  }, TICK_MS);

  setTimeout(() => { console.error('[client] TIMEOUT'); process.exit(2); }, 90000).unref();
})().catch((e) => { console.error('[client] FATAL:', e.message); process.exit(1); });
