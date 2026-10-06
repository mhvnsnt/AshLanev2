// Node-side validation of the exact data-channel mechanics the PeerJS
// prototype (host.js/client.js) relies on: a real WebRTC RTCDataChannel
// carrying 60 ticks of fake player positions with per-tick RTT measurement.
// Signaling is done by exchanging SDP files in ./signal/ (no WebSocket needed),
// because this sandbox blocks outbound WebSockets — see README.md.
// Run:  node werift-host.js   (terminal 1)
//       node werift-client.js (terminal 2)
const fs = require('fs');
const path = require('path');
const { RTCPeerConnection, RTCSessionDescription } = require('werift');

const SIG = path.join(__dirname, 'signal');
const TICKS = 60;
fs.mkdirSync(SIG, { recursive: true });

function waitFor(cond, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let v = false;
      try { v = cond(); } catch (e) { /* file not there yet */ }
      if (v) { clearInterval(iv); resolve(); }
      else if (Date.now() - t0 > timeoutMs) { clearInterval(iv); reject(new Error('timeout: ' + label)); }
    }, 200);
  });
}

(async () => {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  const dc = pc.createDataChannel('ticks', { ordered: true });

  const openP = new Promise((res) => dc.addEventListener('open', res, { once: true }));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitFor(() => pc.iceGatheringState === 'complete', 20000, 'host ICE gathering');
  fs.writeFileSync(path.join(SIG, 'offer.json'), JSON.stringify(pc.localDescription));
  console.log('[host] offer written, waiting for answer...');

  await waitFor(() => fs.existsSync(path.join(SIG, 'answer.json')), 45000, 'answer file');
  const answer = JSON.parse(fs.readFileSync(path.join(SIG, 'answer.json'), 'utf8'));
  await pc.setRemoteDescription(new RTCSessionDescription(answer.sdp, answer.type));
  console.log('[host] answer applied, waiting for data channel...');

  await Promise.race([
    openP,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout: data channel open')), 30000)),
  ]);
  console.log('[host] data channel OPEN');

  let hx = 320, hy = 240, ticks = 0;
  const start = Date.now();
  dc.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    hx += 0.5; // fake host player motion
    dc.send(JSON.stringify({ type: 'echo', tick: msg.tick, x: msg.x, y: msg.y, hx, hy }));
    if (++ticks >= TICKS) console.log(`[host] served ${ticks} ticks in ${Date.now() - start}ms`);
  });

  dc.addEventListener('close', () => { console.log('[host] done'); pc.close(); process.exit(0); });
  setTimeout(() => { console.error('[host] TIMEOUT'); process.exit(2); }, 90000).unref();
})().catch((e) => { console.error('[host] FATAL:', e.message); process.exit(1); });
