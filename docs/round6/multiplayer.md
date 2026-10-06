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
