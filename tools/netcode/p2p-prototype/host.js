// AshLane netcode R4 — PeerJS P2P prototype (HOST side).
// Run in browser: bundle with the game (PeerJS uses native WebRTC).
// Run in Node:    node -r ./werift-shim.js host.js
//   (werift-shim exposes a pure-TS WebRTC stack as globals; the standard
//   native `wrtc` package cannot install in restricted sandboxes.)
//   Then, in another terminal:  node -r ./werift-shim.js client.js
//   (host writes its peer id to ./peer-id.txt; the client reads it)
// Signaling: the public PeerJS cloud (0.peerjs.com) — used ONLY to exchange
// SDP/ICE. All game data flows directly peer-to-peer over the encrypted
// WebRTC data channel.
const fs = require('fs');
const { Peer } = require('peerjs');
const werift = require('werift');

const HOST_ID = 'ashlane-rt-host-' + Math.random().toString(36).slice(2, 8);
const TICKS = 60;

// Fake host player drifting right; tick = 1/60s of game time.
let hostX = 320, hostY = 240;

const peer = new Peer(HOST_ID, {
  host: '0.peerjs.com',
  port: 443,
  path: '/',
  secure: true,
  debug: 1,
});

peer.on('open', (id) => {
  console.log(`[host] peer open, id=${id}`);
  fs.writeFileSync('./peer-id.txt', id);
});

peer.on('connection', (conn) => {
  console.log('[host] incoming data connection');
  conn.on('open', () => {
    console.log('[host] data channel open');
    let ticks = 0;
    const start = Date.now();
    conn.on('data', (msg) => {
      // Echo immediately with host's fake position (this is the round-trip leg).
      hostX += 0.5;
      conn.send({ type: 'echo', tick: msg.tick, x: msg.x, y: msg.y, hx: hostX, hy: hostY });
      ticks++;
      if (ticks >= TICKS) {
        console.log(`[host] served ${ticks} ticks in ${Date.now() - start}ms`);
      }
    });
    conn.on('close', () => { console.log('[host] client disconnected'); process.exit(0); });
  });
});

peer.on('error', (err) => { console.error('[host] peer error:', err.type, err.message); });
setTimeout(() => { console.error('[host] TIMEOUT: no client connected in 45s'); process.exit(2); }, 45000);
