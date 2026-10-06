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
