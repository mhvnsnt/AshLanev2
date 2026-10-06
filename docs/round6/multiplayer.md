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
