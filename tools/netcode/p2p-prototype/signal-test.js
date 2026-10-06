// Test A — PeerJS signaling against the public cloud (no WebRTC needed).
// Proves: peer registration + WebSocket signaling round-trip through 0.peerjs.com.
// Run: node signal-test.js   (requires the werift-shim on Node; browsers need nothing)
require('./werift-shim'); // Node only: expose werift WebRTC as globals for PeerJS
const { Peer } = require('peerjs');

const id = 'ashlane-sigtest-' + Math.random().toString(36).slice(2, 8);
console.log('[signal] registering as', id);

const peer = new Peer(id, { host: '0.peerjs.com', port: 443, path: '/', secure: true });

peer.on('open', (pid) => {
  console.log('[signal] open as', pid);
  peer.listAllPeers((peers) => {
    console.log('[signal] listAllPeers OK —', peers.length, 'peer(s) visible on cloud');
    console.log('[signal] SIGNALING TEST PASSED');
    process.exit(0);
  });
});

peer.on('error', (e) => { console.error('[signal] peer error:', e.type, e.message); process.exit(1); });
setTimeout(() => { console.error('[signal] TIMEOUT after 30s'); process.exit(2); }, 30000);
