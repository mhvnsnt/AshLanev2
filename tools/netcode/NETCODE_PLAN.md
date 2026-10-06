# AshLane Versus Netcode Plan (Round 4 — Netcode track)

**Rule: only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL)
libraries go in the game build.** Every library below had its license verified
live on 2026-10-06 (repo LICENSE file or npm registry).

## 1. Library verdicts (what is actually usable from a browser game today)

| Library | License (verified) | What it is | Verdict |
|---|---|---|---|
| **PeerJS** (`peerjs`, peers/peerjs) | **MIT** (LICENSE file, repo) | WebRTC P2P with a hosted signaling cloud (`0.peerjs.com`) or self-hosted PeerServer | ✅ **Transport pick.** Dead simple: peer id → `peer.connect(id)` → data channel. Prototype in `p2p-prototype/`. |
| **trystero** (`trystero`, dmotz/trystero) | **MIT** (LICENSE file, repo) | P2P via WebRTC; signaling over BitTorrent trackers / Nostr / MQTT / IPFS / Supabase / Firebase / self-hosted relay. Room + action abstractions, auto serialization, optional E2E encryption | ✅ **Viable zero-server alternative** (see §6). Slightly higher-level than PeerJS; pick one, not both. |
| **werift** (`werift`, shiguredo) | **MIT** (npm registry) | Pure-TypeScript WebRTC stack — runs in Node with zero native deps | ✅ Test/dev tool (used it to probe WebRTC in this sandbox). Not needed in the browser. |
| **@zakkster/lite-rollback** (+ `-webrtc` / `-local` transports) | **MIT** (npm registry) | Zero-GC binary ring buffer + GGPO-shaped rollback `Session` for the browser. `createSession({capacity, fields, numPlayers, inputWords, simulate})` — declare state as typed arrays, one memcpy per snapshot, transports pluggable | ✅ **Rollback pick (leading candidate).** Single-file ESM, zero deps, designed exactly for this. Needs a spike: verify `feedRemoteInput` + resim behavior under jitter before committing. |
| **rollback-netcode** (`rollback-netcode`, someusername6) | **MIT** (LICENSE file, repo) | TS P2P rollback lib: `Game` interface (`serialize`/`deserialize`/`step`/`hash`), `createSession`, WebRTC transport, N-player, desync detection | ⚠️ **Backup.** Fuller-featured (rooms, join/leave, desync recovery) but v0.0.6, "under active development, APIs may change", single maintainer. Spike it against lite-rollback. |
| **klokwork** (dhyabi2/klokwork) | **MIT** (GitHub API) | Deterministic fixed-timestep engine *for Three.js* with lockstep+rollback netcode, replay files, desync detection, 293 tests | ⚠️ **Reference, not a dependency** (yet). Architecture is exactly right for AshLane (sim/render split, tick-pure systems), but it's a whole engine layer — study its Block 1/2, don't adopt wholesale until AshLane's sim shape is settled. |
| **telegraph** (@tboyt/telegraph) | MIT | GGPO-style netcode for WebRTC games | ❌ Abandoned (last publish 2022, v0.0.3). |
| **DelayNoMore** (genxium) | none | JS delayed-input rollback demo (162★) | ❌ No license — reference only. |
| **GGRS** (gschup/ggrs, Rust) | MIT/Apache-2.0 | The gold-standard rollback lib (GGPO reimagined) | ❌ **No JS/WASM build exists.** Browser path is Rust+WASM via Matchbox (MIT/Apache) — real (live 2–4 player Bevy demos), but it means writing the sim in Rust. Wrong call for a three.js/TS game; revisit only if AshLane ever gets a Rust sim core. |
| **GGPO** (pond3r/ggpo, C++) | MIT | The original | ❌ Native only. Not usable from the browser. |

**Bottom line:** there is no drop-in "GGPO for JS" with GGRS's maturity. The
practical options are `@zakkster/lite-rollback` (lean, GGPO-shaped, spike first)
or a hand-rolled input-ring + snapshot system (~300–500 lines for 2 players —
very doable, and it forces the determinism discipline the game needs anyway).

## 2. Recommended architecture: P2P + rollback primary, Nakama relay fallback

```
                    ┌──────────────┐
   matchmaking /    │    Nakama    │   (rounds 1–3: already being wired)
   accounts /       │  (authoritative relay fallback,
   ranked ladder    │   lobby, presence)
                    └──────┬───────┘
                           │ 1. find match, exchange peer ids
                           ▼
   ┌──────────┐   WebRTC data channel (DTLS-encrypted)   ┌──────────┐
   │ Player A │◄───────── inputs @60Hz ────────────────►│ Player B │
   │  sim+    │   P2P+rollback (PeerJS or trystero)      │  sim+    │
   │  render  │                                          │  render  │
   └──────────┘                                          └──────────┘
                           │ only if P2P fails (~10–15% of NAT pairs)
                           ▼
                    Nakama relayed match (input-delay netcode)
```

**When to use P2P+rollback:** the default for 1v1 versus. Lowest latency (no
server hop), zero server bandwidth cost, rollback hides the RTT.

**When to use Nakama relay:** (a) ICE fails and no direct P2P path exists —
fall back to relayed packets through Nakama (same input stream, degrade to
input-delay, see §3); (b) 3+ player modes (free-for-all / tag) — mesh P2P
bandwidth grows as O(n²), a relay is simpler; (c) ranked/anti-cheat — a server
can validate checksums and arbitrate disputes even if the sim stays P2P.

**Do not** build versus on pure client-server lockstep as the primary path: every
input pays a full server round-trip before it renders, which feels terrible in
a brawler. Server relay is the *fallback*, not the plan.

## 3. Input-delay vs rollback — tradeoffs for a brawler

| | Input-delay | Rollback (GGPO-style) |
|---|---|---|
| How it works | Both clients wait N frames so inputs arrive "on time"; sim never rewinds | Simulate immediately on local input, predict remote input (repeat last), rewind + resimulate on mispredict |
| Feel | Constant input lag = N frames (at 150ms RTT ≈ 9 frames ≈ very noticeable) | Zero local lag; remote mispredicts cause 1–3 frame visual snaps |
| Brawler fit | **Poor.** Urban Reign/Def Jam-style combat lives on 3–6 frame punishes and whiff-punish reads. 9 frames of built-in delay kills footsies. | **Good.** Brawlers have bursty, committed moves (startup/active/recovery) — prediction is right most of the time, and a 2–3f resim is invisible inside a 12f punch. |
| Implementation cost | Low (a jitter buffer) | Medium (deterministic sim + snapshots + resim) |
| Bandwidth | Same (inputs @60Hz are tiny) | Same |

**Recommendation: rollback for versus; input-delay only as the degraded mode**
when relaying through Nakama (where RTT is higher and stable, so a fixed delay
is at least predictable). Never ship input-delay as the primary versus
experience.

Rollback costs that must be paid regardless: the sim has to be **deterministic**
(§4). That work is the real project; the rollback driver on top is small.

## 4. What a 2-player fight needs synchronized

The golden rule: **sync inputs, not state.** State follows deterministically.

1. **Inputs @60Hz** — one small bitmask per player per tick (e.g. 16 bits:
   8-way move, punch, kick, block, grab, special, jump, taunt). ~2 bytes/player/
   tick ≈ 120 B/s/player. Trivial. Send redundantly (last 3–10 inputs per
   packet) so a dropped packet doesn't stall the remote sim.
2. **RNG seed** — exchanged once at match start (during the versus handshake).
   All randomness (hit sparks, AI, crowd) derives from a seeded PRNG
   (`mulberry32` or equivalent). **Nothing in the sim may call `Math.random()`,
   `Date.now()`, or iterate objects in insertion order.** This is the #1 desync
   source — enforce with a lint rule or a dev-mode `Math.random` poison.
3. **Hit confirmations** — NOT synced. If both sims are deterministic and see
   the same inputs, both compute the same hits. Syncing hit results is a
   desync *mask*, not a fix. Instead, sync **state checksums** (e.g. hash of
   positions/velocities/health every 30 ticks); on mismatch, resync from a
   full snapshot (rollback-netcode and lite-rollback both expose checksum hooks).
4. **Snapshots for rewind** — the world state must be serializable to a flat
   buffer every tick (typed arrays: positions, velocities, stun timers, health,
   animation clock, RNG state). This is also what enables replays and
   spectating for free. Design the sim state as **struct-of-arrays from day
   one** — it makes snapshots a memcpy and matches lite-rollback's model.

What does NOT need syncing: animation poses, particles, camera, crowd, audio —
all cosmetic, derived from sim state locally.

## 5. Phased plan

- **Phase 0 — Determinism foundation (prerequisite, no networking).**
  Fixed-timestep sim (60Hz accumulator, render interpolation), sim/render split,
  seeded PRNG everywhere, input bitmask abstraction, per-tick state snapshot +
  checksum. Prove it with a **SyncTest**: run the same input script twice,
  checksums must match bit-for-bit; then run with simulated rollback (rewind
  N frames, resim) and confirm the checksum still matches.
- **Phase 1 — Local versus + replay.** Two gamepads/keyboard halves, input
  recording to a replay file, replay playback. This exercises the snapshot and
  input-stream machinery with zero networking.
- **Phase 2 — P2P transport (no rollback yet).** Wire `p2p-prototype/` into the
  game: lobby → exchange peer ids (manual code or Nakama matchmaking) →
  WebRTC data channel → exchange input streams with a small input-delay
  (2–3 frames). Playable 1v1, laggy but real. Validates NAT traversal rates
  and gives a baseline feel.
- **Phase 3 — Rollback.** Drop the input delay to 0 local frames; integrate
  `@zakkster/lite-rollback`'s `Session` (or the hand-rolled equivalent):
  predict remote inputs, `feedRemoteInput` → rewind/resim, checksum-based
  desync detection with snapshot resync. Target: ≤3-frame resims invisible at
  ≤100ms RTT.
- **Phase 4 — Relay fallback + hardening.** If ICE fails after ~5s, fail over
  to Nakama-relayed inputs (input-delay mode). Add reconnect, host migration
  is out of scope for 1v1 (rematch instead), rage-quit handling.
- **Phase 5 — Polish.** Rollback visualization (subtle, for debug), connection
  quality indicator (RTT + resim frames), spectator mode (delayed input stream
  is a free spectator feed), ranked hooks.

## 6. WebRTC notes (brief)

- **Encryption:** WebRTC data channels are **always DTLS-encrypted** — there is
  no unencrypted mode. Keying is automatic per peer connection. (Trystero adds
  an optional extra app-level encryption layer on top; unnecessary for game
  inputs, useful if you ever send account-adjacent data P2P.)
- **NAT traversal:** ICE + STUN handles most home NATs. Budget for a **TURN
  server** for the ~10–15% of pairs where it doesn't (symmetric NATs, strict
  corporate firewalls) — or accept the Nakama-relay fallback instead of running
  TURN. Public STUN (`stun.l.google.com:19302`) is fine for dev; self-host
  `coturn` (BSD-licensed) for production if you need TURN.
- **Sandbox finding:** this build environment blocks outbound WebSocket
  upgrades *and* all UDP, so neither PeerJS signaling nor ICE can run here —
  see `p2p-prototype/README.md` for the exact failure modes. Test P2P on real
  networks/browsers.

## 7. trystero — zero-server alternative assessment

- **License:** MIT — verified live (LICENSE file, dmotz/trystero). Game-safe.
- **API (skimmed):** `import {joinRoom} from 'trystero'` (default = Nostr
  strategy; swap import for BitTorrent/MQTT/IPFS/Supabase/Firebase/self-hosted
  WS relay). `const room = joinRoom({appId}, roomId)` → `room.onPeerJoin`,
  `const [send, receive] = room.makeAction('inputs')`, binary support,
  progress events, React hooks. No accounts, no infra to deploy.
- **Fit:** genuinely viable for AshLane versus. For a 1v1 friend-match flow
  ("share this room code"), trystero removes even the PeerJS cloud dependency —
  peers discover each other over public BitTorrent trackers. Same WebRTC data
  channels underneath, so the rollback layer is identical either way.
- **Caveats:** (1) discovery depends on public tracker/relay availability —
  fine for casual play, less predictable than a PeerServer you control;
  (2) the room/action abstraction is higher-level than PeerJS's raw data
  channel — check it exposes unordered/unreliable delivery if you want it
  (inputs want reliable-ordered; fine either way at this size);
  (3) room codes are guessable — add your own join secret for anything ranked.
- **Recommendation:** spike trystero alongside PeerJS in Phase 2 and keep the
  transport behind a tiny interface (`sendInputs(bytes)`, `onInputs(cb)`,
  `onPeerJoin/Leave`) so the game never cares which one is underneath.

## 8. Open questions for the coordinator

1. Spike first: `@zakkster/lite-rollback` vs hand-rolled vs `rollback-netcode`
   — 1–2 days, measure resim cost on the real sim state size.
2. PeerJS cloud vs self-hosted PeerServer vs trystero — decide in Phase 2
   after measuring NAT success rates; keep the transport interface abstract.
3. Sim language: staying TS/three.js keeps GGRS off the table (Rust/WASM only)
   — confirmed the right call for now.
