// AshLane netcode R4 — PeerJS P2P prototype (CLIENT side).
// Run in browser: bundle with the game (PeerJS uses native WebRTC).
// Run in Node:    node -r ./werift-shim.js client.js <host-peer-id>
//   (or reads ./peer-id.txt written by the host)
// Sends 60 ticks of fake player positions, measures round-trip time per tick.
const fs = require('fs');
const { Peer } = require('peerjs');

const TICKS = 60;
const TICK_MS = 1000 / 60;
const hostId = process.argv[2] || fs.readFileSync('./peer-id.txt', 'utf8').trim();
console.log(`[client] connecting to host ${hostId}`);

const peer = new Peer({ host: '0.peerjs.com', port: 443, path: '/', secure: true, debug: 1 });

peer.on('open', () => {
  console.log('[client] peer open, dialing host...');
  const conn = peer.connect(hostId, { reliable: true });
  conn.on('open', () => {
    console.log('[client] data channel open — starting 60-tick sync');
    const rtts = [];
    let sent = 0, received = 0;
    const sendTimes = new Map();
    let x = 100, y = 200;

    conn.on('data', (msg) => {
      if (msg.type === 'echo') {
        const rtt = performance.now() - sendTimes.get(msg.tick);
        rtts.push(rtt);
        received++;
        if (received >= TICKS) {
          const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
          const sorted = [...rtts].sort((a, b) => a - b);
          const p95 = sorted[Math.floor(sorted.length * 0.95)];
          console.log(`[client] DONE: ${received}/${TICKS} echoes`);
          console.log(`[client] RTT avg=${avg.toFixed(2)}ms  min=${sorted[0].toFixed(2)}ms  p95=${p95.toFixed(2)}ms  max=${sorted[sorted.length-1].toFixed(2)}ms`);
          process.exit(0);
        }
      }
    });

    const timer = setInterval(() => {
      if (sent >= TICKS) { clearInterval(timer); return; }
      x += 0.5; y += 0.25; // fake local player motion
      sendTimes.set(sent, performance.now());
      conn.send({ type: 'tick', tick: sent, x, y });
      sent++;
    }, TICK_MS);
  });
  conn.on('error', (e) => { console.error('[client] conn error:', e); process.exit(1); });
});

peer.on('error', (err) => { console.error('[client] peer error:', err.type, err.message); process.exit(1); });
setTimeout(() => { console.error('[client] TIMEOUT: no connection in 45s'); process.exit(2); }, 45000);
