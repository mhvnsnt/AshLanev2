# Round 6 — Multiplayer services & backend

Research-only wave. Targets: voice chat, matchmaking servers, lobby frameworks,
web-game chat, ranked/ELO libs, replay systems, spectator references, free hosting
tiers, abuse/anti-cheat basics. Skips everything from rounds 1–5 (Nakama + client,
PeerJS/trystero, lite-rollback, coturn, Umami) — see docs/FREE_APIS_AND_PUBLIC_DOMAIN.md.

License rule (owner binding): prototype may use whatever WORKS. Every license below
was read from the project's actual LICENSE file / repo license field at research
time — re-verify before shipping. Verdicts: **commercial-safe** or **prototype-only**.
Server-side AGPL is flagged but less scary than client-side copyleft.

Research date: 2026-10-06.

---
## 1. LiveKit — voice (and video/data) for lobbies & parties
- **URL:** https://github.com/livekit/livekit (server) · https://github.com/livekit/client-sdk-js (browser client)
- **What:** End-to-end realtime stack: Go SFU media server (Pion WebRTC) + browser
  JS SDK + Unity/Unreal/React-Native SDKs. Rooms, audio/video/data tracks, built-in
  TURN (no separate coturn needed for most NATs), Egress (server-side room
  recording → file/S3 — doubles as a replay-clip recorder), Ingress (RTMP/WHIP in).
  Single binary or Docker; LiveKit Cloud has a free monthly bandwidth/transcoding tier.
- **License:** **Apache-2.0** — server LICENSE verified (repo field: "Apache License
  2.0", README: "LiveKit server is licensed under Apache License v2.0"); browser
  client-sdk-js also Apache-2.0 (org repo listing, 2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** Best-fit voice solution for AshLane parties/lobbies: one room per lobby,
  audio-only tracks, ~21k stars, production-proven. Client ships Apache-2.0 code in
  the game — fine. Egress gives server-side match recording for highlights without
  client CPU cost. Self-host on the same box as Nakama; token auth mints from the
  game backend. Watch: SFU bandwidth scales with speakers — audio-only is cheap.

---
## 2. mediasoup — SFU library (DIY voice, maximum control)
- **URL:** https://github.com/versatica/mediasoup (canonical; search surfaced a fork mirror)
- **What:** Cutting-edge WebRTC SFU as a Node.js library (not a server product):
  C++ worker + JS API. You build your own selective-forwarding server: per-lobby
  voice rooms, spatial audio routing, custom mixing. Lower-level than LiveKit —
  no rooms/auth/recording out of the box, but total control and tiny footprint.
- **License:** **ISC** (README "## License → [ISC](./LICENSE)", verified 2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** Pick mediasoup over LiveKit only if we need custom audio processing
  (proximity voice in open-world hubs, per-player gain/occlusion) or want zero
  dependency on LiveKit's opinionated room model. Needs a signaling layer
  (Centrifugo below, or Nakama) + own TURN (coturn from round 4). More code, more
  control. mediasoup-client (JS) is also ISC.

---
## 3. Mumble (+ Murmur server) — classic gamer VoIP
- **URL:** https://github.com/mumble-voip/mumble
- **What:** The open-source TeamSpeak alternative, built for gamers since 2005:
  ultra-low-latency Opus voice, positional audio API, channel hierarchies with
  ACLs, push-to-talk, encrypted by default. Server is "Murmur" — tiny footprint,
  runs anywhere. Clients on every platform. For AshLane: tournament voice lobbies
  and crew channels; positional audio maps naturally to open-world proximity chat.
  Browser path: Mumble protocol clients exist (e.g. mumdroid reference; gumble Go
  lib is MPL-2.0 — flag; haydenmc/mumble-webrtc-bridge bridges Mumble ↔ WebRTC).
- **License:** **BSD-3-Clause** (Wikipedia + repo forks confirm; vendored libopus
  also BSD-3-Clause).
- **Verdict:** commercial-safe.
- **Notes:** No WebRTC — native protocol over TCP/UDP, so browser voice needs a
  bridge or a native/Electron wrapper. Best as the "serious crew voice" option
  alongside LiveKit's in-browser path. Murmur uses ~10–40 kbit/s per user.

---
## 4. Open Match — matchmaking framework
- **URL:** https://github.com/googleforgames/open-match
- **What:** Google-origin open-source matchmaking framework: the hard plumbing
  (ticket queues, match profiles, evaluator/synchronizer cycle) is provided as Go
  microservices; you write only the match logic (Director + MatchFunction) — e.g.
  "pair 1v1 fighters within ±150 rating and <80ms ping". Pairs with Agones
  (below): Open Match makes the match, Agones allocates the dedicated server.
- **License:** **Apache-2.0** (repo license badge + README "Apache 2.0", verified).
- **Verdict:** commercial-safe — but heavyweight.
- **Notes:** Designed for Kubernetes at scale; overkill for launch, right-shaped
  for growth. ⚠️ Maintenance caveat (2026-10-06): community notes say upstream
  went quiet after maintainers stepped down (~Dec 2023) — treat as
  adopt-with-care; the Nakama built-in matchmaker covers ranked 1v1 until player
  counts justify this. Evaluate at the "we need custom match functions" stage,
  not now.

---
## 5. Colyseus — rooms, lobbies, state sync (Node.js)
- **URL:** https://github.com/colyseus/colyseus
- **What:** Multiplayer framework for Node.js: room-based architecture with
  built-in matchmaking (filtering, queuing, reconnection), delta-compressed
  binary state sync via @colyseus/schema, and JS/Unity/Defold/Haxe clients.
  Authoritative-server model = cheat-resistant by design. v0.17/0.18 line in
  2026 (public 1.0 roadmap); scales with Redis presence.
- **License:** **MIT** — "Free forever, even for commercial games" (README +
  repo license field, verified 2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** Strongest lobby/matchmaking complement to Nakama in this wave:
  Nakama owns accounts/storage/leaderboards; Colyseus owns live rooms (fight
  lobbies, crew hangouts, spectator rooms) with automatic state sync. JS client
  drops straight into the three.js build. Colyseus Cloud is a separate paid
  product ($15/mo) — self-host is free/unlimited. Pair with openskill.js (#10)
  for rated rooms.

---
## 6. Centrifugo — realtime lobby chat & presence
- **URL:** https://github.com/centrifugal/centrifugo
- **What:** Language-agnostic realtime messaging server (Go): PUB/SUB over
  WebSocket, SSE, HTTP-streaming, gRPC, WebTransport. Channels with presence,
  join/leave events, message history + recovery. Backend publishes via HTTP/gRPC
  API; browser JS client subscribes. The self-hosted answer to Pusher/Ably —
  one Docker container, millions of connections.
- **License:** **Apache-2.0** (repo LICENSE badge + skill metadata, verified
  2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** Perfect lobby-chat + presence layer: global chat, crew channels,
  "friend online" presence, match-found push, live tournament brackets. Decouples
  realtime transport from game logic — Nakama/Colyseus stay authoritative while
  Centrifugo fans out chat. Namespaces give per-channel history TTLs and presence
  toggles. Single binary; Redis engine for horizontal scale later.

---
## 7. Matrix — E2EE chat (matrix-js-sdk + Tuwunel homeserver)
- **URL:** https://github.com/matrix-org/matrix-js-sdk (browser client) ·
  https://github.com/matrix-construct/tuwunel (homeserver)
- **What:** Open federated chat protocol with end-to-end encryption
  (Olm/Megolm), rooms, DMs, message history, typing/presence. matrix-js-sdk is
  the TypeScript client (used by Element Web); Tuwunel is the actively-maintained
  Rust homeserver (successor of the Conduit→conduwuit lineage, v1.5.x in 2026,
  ~20–50 MB idle RAM, embedded RocksDB, single Docker container, SSO/OIDC).
- **License:** **Apache-2.0** for both (matrix-js-sdk: SPDX Apache-2.0, verified
  via npm/third-party notices; Tuwunel: Apache-2.0, verified 2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** The "serious" chat option: E2EE DMs, persistent crew rooms, and
  federation (players could chat from any Matrix client). Heavier than
  Centrifugo: accounts/homeserver are mandatory per MXID, history persists by
  default, E2EE needs per-device key state. ⚠️ Avoid Synapse/Dendrite — relicensed
  AGPL-3.0 (Nov 2023); Tuwunel keeps the permissive lineage. Use Matrix if chat
  is a product pillar; use Centrifugo (#6) if it's just lobby chat.

---
## 8. hyperswarm — serverless P2P lobbies (DHT + hole-punching)
- **URL:** https://github.com/holepunchto/hyperswarm
- **What:** Distributed networking stack from Holepunch: join a 32-byte topic on
  the public DHT, get NAT-traversed peer connections with Noise encryption —
  no signaling server, no accounts, no infrastructure. `swarm.join(topic)` is a
  whole lobby-discovery system in one call. Same family as trystero (round 4)
  but DHT-based rather than tracker-based, with stronger NAT traversal.
- **License:** **MIT** (repo LICENSE, verified via docs/dependents 2026-10-06).
- **Verdict:** commercial-safe — with a platform caveat.
- **Notes:** Caveat: hyperswarm needs raw UDP/TCP sockets — runs in Node,
  Electron, or native wrappers, NOT in a plain browser tab (browser clients need
  a WebSocket→DHT relay such as @hyperswarm/dht-relay). Fit: the native/Electron
  build's serverless quick-match, LAN-party discovery, and dev-time lobbies with
  zero backend cost. Pairs with the round-4 P2P netcode plan: DHT replaces the
  tracker for peer discovery.

---
## 9. Agones — dedicated game-server fleet orchestration
- **URL:** https://github.com/agones-dev/agones (moved from googleforgames/agones)
- **What:** Kubernetes-native hosting for dedicated game servers: CRDs
  (GameServer/Fleet/FleetAutoscaler) that allocate, health-check, scale, and
  shut down server processes; SDK sidecar lets the game server signal
  Ready/Allocated/Shutdown. Used in production by Ubisoft, Embark. Helm install,
  Prometheus metrics out of the box.
- **License:** **Apache-2.0** (repo LICENSE + pkg.go.dev, verified 2026-10-06).
- **Verdict:** commercial-safe — infra-stage only.
- **Notes:** The answer to "we outgrew one Nakama box": run authoritative fight
  servers as an Agones fleet, autoscaled by queue depth. Presupposes a K8s
  cluster and a separately-built dedicated server binary — NOT a launch-stage
  tool. Pair with Open Match (#4): matchmaker picks players, Agones provides the
  arena. Revisit when CCU or cheat pressure demands dedicated servers.

---
## 10. openskill.js — ranked ratings (TrueSkill without the patent)
- **URL:** https://github.com/philihp/openskill.js (npm: `openskill`)
- **What:** JavaScript implementation of the Weng-Lin Bayesian rating system — the
  open-license TrueSkill alternative (TrueSkill itself is Microsoft-patented).
  Tracks μ (skill) + σ (uncertainty) per player; `ordinal()` (μ−3σ) for
  leaderboard display; handles 1v1, teams, asymmetric teams, free-for-alls, ties,
  and raw scores. Plackett-Luce default, Bradley-Terry/Thurstone-Mosteller
  models available. ~20× faster than TrueSkill.
- **License:** **MIT** (GitHub repo license field + LICENSE file, verified live
  2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** The ranked-mode rating engine: store (μ,σ) in Nakama storage,
  `rate()` after each ranked match, display `ordinal()`. Handles future
  2v2/crew-battle modes natively (ELO doesn't). `predictWin`/`predictDraw` give
  match-quality estimates for the matchmaker. Zero deps, runs in the Nakama TS
  runtime or a Colyseus room.

---
## 11. rrweb — session replay (record & replay the web)
- **URL:** https://github.com/rrweb-io/rrweb
- **What:** Records DOM mutations + user input as a typed JSON event stream and
  replays them pixel-perfect (rrweb-player). Powers session replay at Sentry,
  PostHog, Amplitude, Highlight. Canvas recording plugin captures WebGL/canvas
  frames; live-stream mode enables co-browsing/mirroring. ~20k stars.
- **License:** **MIT** (LICENSE, reproduced in multiple downstream
  THIRD-PARTY-NOTICES, verified 2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** Two AshLane uses: (1) bug-report replays — record menu/lobby
  sessions on error (mask inputs with `rr-block`/`rr-mask`); (2) spectator-lite —
  stream rrweb events of a match's DOM/canvas overlay to viewers with 1–2s
  delay. NOT a substitute for deterministic input-log replays of the fight sim
  itself (those come from the round-4 rollback checksums/input logs — byte-exact
  and 100× smaller). Use rrweb for UI sessions, input logs for fights.

---
## 12. mp4-muxer — in-browser replay clips (WebCodecs → MP4)
- **URL:** https://github.com/Vanilagy/mp4-muxer (npm: `mp4-muxer`)
- **What:** Pure-TypeScript MP4 multiplexer on the WebCodecs API: feed it
  encoded video/audio chunks (e.g. from a canvas-captured fight replay) and get
  a downloadable/shareable .mp4 — no server, no ffmpeg.wasm, no upload. Built
  for exactly this use case: an offline replay renderer for a web game
  (author's marbleblast game), rendering at any resolution/framerate.
- **License:** **MIT** (LICENSE, verified via downstream THIRD-PARTY-NOTICES
  2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** "Save highlight clip" feature without backend cost: re-simulate the
  input log offscreen → WebCodecs encode → mp4-muxer → shareable file. Sibling
  webm-muxer is **deprecated** by the author (migrate to mediabunny, which is
  MPL-2.0 = prototype-only under the license rule) — use mp4-muxer. ⚠️ Do NOT
  bundle ffmpeg.wasm with libx264 into the game client (GPL encoder concern,
  flagged in round 5) — WebCodecs + mp4-muxer keeps it clean.

---
## 13. Owncast — self-hosted spectator streaming
- **URL:** https://github.com/owncast/owncast
- **What:** Self-hosted live-streaming + chat server (the open Twitch): RTMP
  ingest → HLS out, built-in chat, ActivityPub federation, single Go binary.
  ~11k stars, one-click images on Hetzner/DigitalOcean.
- **License:** **MIT** (README "Distributed under the MIT License" + repo field,
  verified 2026-10-06).
- **Verdict:** commercial-safe.
- **Notes:** The spectator-mode answer for tournaments: stream featured matches
  (RTMP from a headless game client or LiveKit Egress) to a self-hosted Owncast
  with chat — no Twitch cut, no ToS risk, full branding. Lower latency than
  HLS-only setups isn't its strength (~10–30s HLS delay); for near-realtime
  spectating use LiveKit viewer roles or rrweb live-stream mode instead, and
  Owncast for the public broadcast. Watch: bandwidth is the real cost — budget
  per-viewer egress.

---
## 14. lichess (lila) — REFERENCE ONLY: spectator TV, ratings, seeks
- **URL:** https://github.com/lichess-org/lila
- **What:** The gold-standard open online game server (millions of games/day):
  "TV" spectator channels (top games auto-broadcast), seek/lobby system,
  Glicko-2 ratings with RD decay, tournaments (Arena/Swiss), relays/broadcasts,
  simul mode. Study the architecture, not the code: how they do cheap
  spectating (game stream fan-out), seek matching, and rating presentation.
- **License:** **AGPL-3.0** (LICENSE + COPYING.md, verified 2026-10-06).
- **Verdict:** prototype-only — **reference only, do not ship lila code.**
  Client-side AGPL copyleft would infect the game build; even server-side,
  the network clause forces source disclosure of a modified deployment.
- **Notes:** Read-only value: `modules/round` (WebSocket game fan-out),
  `modules/tv` (spectator channel selection), `modules/tournament`, rating
  code. Also note their CC0 side-assets (chess-openings, puzzle DB) are NOT
  usable here (chess-specific). Take patterns, reimplement from scratch —
  exactly like the digichess project does.

---
## 15. Free hosting tiers — what's ACTUALLY free (compute, Oct 2026)
- **URL:** vendor pricing pages (figures cross-checked 2026-09/10 research)
- **What:** Survey of where to run Nakama/LiveKit/Colyseus/Centrifugo for $0.
- **License:** n/a (services, not code). **Verdict:** commercial-safe (paid tiers).
- **Findings:**
  - **Oracle Cloud Always Free — the clear winner.** Up to 4 ARM Ampere OCPUs /
    24 GB RAM (newer docs say 2 OCPU/12 GB — varies by revision), 200 GB block
    storage, **10 TB/mo egress**, 2×20 GB autonomous DBs, FOREVER. Runs the whole
    stack (Nakama + LiveKit + Postgres + TURN) on one box. Caveats: credit card
    required for verification; ARM capacity scarce in popular regions (try Seoul/
    Osaka/Mumbai); idle instances can be reclaimed — keep a heartbeat.
  - **Google Cloud free tier:** 1× e2-micro (1 GB RAM, 30 GB disk) always-free +
    Cloud Run 2M req/mo. Fine for a bastion/sidecar, not the game backend.
  - **Fly.io: NO free tier for new accounts** (removed Oct 2024). Pay-as-you-go
    only, ~2-hour/7-day trial, practical minimum ~$2–5/mo. Grandfathered Hobby
    orgs keep old allowances — one-way door, don't switch plans.
  - **Railway:** $5 one-time trial credit (30 days, no card) → Free plan =
    **$1/mo credit** (1 vCPU, 0.5 GB RAM — a tiny idle app, not a backend).
    Hobby $5/mo includes $5 usage credit. Good DX, not free.
  - **Render:** free web services = 750 hrs/mo, **sleeps after 15 min idle**
    (30–50s cold start; a keep-alive ping every 10 min fits in the allowance and
    keeps one service warm). Static sites free. Bandwidth 5 GB/mo then $0.15/GB.
  - **Koyeb:** free tier closed to new signups in 2026 (Mistral acquisition).
  - **Hetzner:** no free tier (watch for promo credits).
  - **Frontend:** Cloudflare Pages (unlimited bandwidth, no card), Vercel/Netlify
    Hobby — all fine for the web client.
- **Notes:** Launch plan: Oracle ARM box for Nakama+LiveKit+Murmur+Owncast
  (single Docker host, $0), Cloudflare Pages for the client, keep-alive on
  Render only if Oracle capacity fails. Re-check pricing quarterly — free tiers
  keep shrinking.

---
## 16. Managed backend free tiers — data layer (Oct 2026)
- **URL:** vendor pricing pages (figures from 2026-04/09 curated research)
- **What:** Where to put accounts/leaderboards/chat history/rate-limit counters
  for $0. No card required on any of these.
- **License:** n/a (services). **Verdict:** commercial-safe.
- **Findings:**
  - **Supabase:** 500 MB Postgres, 2 projects, 50k MAU auth, 1 GB file storage,
    5 GB egress. ⚠️ Projects **pause after 7 days idle** (wake on request).
    Best all-in-one (auth + DB + realtime + storage).
  - **Neon:** serverless Postgres, 0.5 GB/project, 100 projects, 100 CU-hrs,
    scales to zero after 5 min idle, auto-wakes ~1s. Best pure-Postgres.
  - **Turso:** libSQL/SQLite at the edge — 100 DBs, 5 GB storage, 500M row
    reads/mo. Best for read-heavy edge data (leaderboard reads).
  - **Upstash Redis:** 256 MB, 500k commands/mo, HTTP API (no persistent
    connections — works from edge/serverless). Best for: rate-limit counters,
    presence, matchmaking queues, session cache. `@upstash/ratelimit` gives
    sliding-window limiting in ~5 lines.
  - **Cloudflare D1:** SQLite at edge, 5 GB total, 5M rows read/day.
    Workers free: 100k req/day. R2 object storage: 10 GB, **$0 egress**
    (replay clips, voice/profile uploads).
  - **MongoDB Atlas M0:** 512 MB shared cluster, forever-free.
- **Notes:** Recommended $0 data stack: Supabase (accounts/auth) OR Neon
  (Postgres) + Upstash Redis (rate limits, presence, queues) + R2 (replay/voice
  files). Nakama can keep its own Postgres on the Oracle box (#15) and use
  Upstash only for cross-instance counters when we scale past one box.

---
