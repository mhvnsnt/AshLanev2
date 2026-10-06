# P2P Prototype — PeerJS data-channel state-sync test

Minimal proof that PeerJS (MIT) can establish a WebRTC data-channel connection
between two peers via the public PeerJS cloud signaling server (`0.peerjs.com`)
and run a 60-tick state-sync loop with round-trip measurement.

## Files

| File | Purpose |
|---|---|
| `host.js` / `client.js` | **The deliverable.** Pure PeerJS: host registers on the PeerJS cloud, client dials the host id, a reliable data channel opens, and the client sends 60 fake player-position ticks (`{tick, x, y}` @60Hz) while the host echoes them back; the client reports RTT avg/min/p95/max. Browser-native — bundle with the game. |
| `werift-shim.js` | Node-only: exposes the pure-TS `werift` WebRTC stack as globals so PeerJS (browser-only upstream) loads in Node. Preload with `node -r ./werift-shim.js`. |
| `signal-test.js` | Node-only: PeerJS signaling smoke test (peer `open` + `listAllPeers` against `0.peerjs.com`). |
| `werift-host.js` / `werift-client.js` | Node-only validation of the exact data-channel mechanics `host.js`/`client.js` rely on, using werift directly with file-based SDP exchange (`./signal/`) instead of WebSocket signaling. |
| `werift-diag.js` | One-process two-peer WebRTC diagnostic with ICE state logging. |
| `package.json` | `peerjs` (MIT) + `werift` (MIT, pure-TS WebRTC for Node). `npm install` to fetch. |

## Run

```bash
cd tools/netcode/p2p-prototype
npm install

# In a browser build: bundle host.js/client.js with the game (Vite handles it).
# In Node (needs the shim because Node has no native WebRTC):
node -r ./werift-shim.js host.js      # terminal 1 — prints peer id, writes ./peer-id.txt
node -r ./werift-shim.js client.js    # terminal 2 — dials host, 60 ticks @60Hz, prints RTT stats
```

No account, no API key, no self-hosted server needed. The public PeerJS cloud is
used **only for signaling** (exchanging SDP/ICE); all game data flows directly
peer-to-peer over the encrypted WebRTC data channel.

## Test evidence (2026-10-06, this sandbox, Node 24)

**Result: the sandbox cannot run a live data-channel loop — two independent
network blockers were found and verified. The prototype code is complete and
correct to the API level; the 60-tick loop is untested-but-complete.**

1. **Outbound WebSockets hang.** PeerJS signaling is WebSocket-based. Direct
   `wss://0.peerjs.com/peerjs?key=peerjs…` from Node: no `open`, no `error`, no
   `close` — 25s timeout, even through an explicit `HttpsProxyAgent`.
   A control test to `wss://ws.postman-echo.com/raw` behaved identically, so it
   is not PeerJS-specific: **this sandbox's egress proxy blocks/drops WebSocket
   upgrades** (plain HTTPS to the same hosts works — `https://0.peerjs.com/`
   returns 200). Consequence: `signal-test.js` never gets PeerJS `open`.
2. **UDP is fully blocked.** A localhost UDP datagram between two `dgram`
   sockets never arrived (10s timeout). WebRTC ICE runs over UDP, so ICE
   connectivity checks stall at `checking` forever — verified with
   `werift-diag.js`: SDP offer/answer exchange + ICE gathering both succeed
   (host candidates on `198.19.0.2` gathered fine), then both peers sit in
   `checking`/`connecting` indefinitely and no data channel opens.
3. **PeerJS ≥1.0 is browser-only.** The `wrtc` injection option no longer exists
   (verified absent in 1.3.2, 1.4.7, 1.5.5 sources); the constructor aborts with
   `browser-incompatible` when global `RTCPeerConnection` is missing. The
   `werift-shim.js` preload works around this for Node.
4. **Native `wrtc` can't install here.** Its install script downloads a prebuilt
   binary from `node-webrtc.s3.amazonaws.com`, which the egress proxy rejects
   (`ERR_INVALID_ARG_VALUE` — Host/authority mismatch on the proxy).

**What to do with this:** run `host.js`/`client.js` in two real browsers (or one
machine with normal network) — no code changes needed. The scripts are written
for that path; the Node shims exist only so the sandbox could attempt them.

## Notes

- `/tmp` on this machine is a 512M tmpfs that was full during testing — run
  `npm install` in the repo directory, not `/tmp`.
- `node_modules/`, `package-lock.json`, `*.log`, `peer-id.txt`, `signal/` are
  scratch — not for commit.
