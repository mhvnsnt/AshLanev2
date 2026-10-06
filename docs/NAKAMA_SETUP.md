# AshLane — Nakama Backend Setup

Nakama (Apache-2.0 server + Apache-2.0 `@heroiclabs/nakama-js` client) is
AshLane's optional backend for **device-ID accounts**, a **street-cash
wallet**, and an **arcade leaderboard**. The game is fully playable offline —
every backend call fails soft and falls back to local data when the server
is unreachable.

## What the backend is for in AshLane

| Feature | Nakama primitive | Game use |
|---|---|---|
| Accounts | Device-ID auth (auto-created, no login screen) | Stable per-install player id for wallet + leaderboard |
| **Street cash** ("paper") | Private storage object `wallet/ashlane` | Missions pay paper; spent on bribes, shop gear, minigame stakes (darts/blackjack/pool). Game calls `awardPaper(services, amount)` in `src/game3d/services.ts`. |
| **Arcade leaderboard** | Leaderboard `arcade_high_scores` (desc, best score) | High scores from arcade runs; game calls `backendSubmitScore(services, score)` on run end and `backendLeaderboard(services)` to render the board. Auto-created on the first submitted score. |

Server-side authoritative wallet validation / anti-cheat RPCs are **not**
built yet — the storage object is client-writable, which is fine for local
dev but should be hardened (authoritative wallet RPC) before any public
release.

## 1. Install Docker

- **macOS / Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes `docker compose`).
- **Linux:** install Docker Engine + the Compose v2 plugin per
  [docs.docker.com](https://docs.docker.com/engine/install/), e.g. on Ubuntu:
  `sudo apt install docker.io docker-compose-plugin`, then add your user to
  the `docker` group and log back in.

Verify: `docker compose version` prints a version.

## 2. Start the server (one command)

From the repo root:

```sh
cd tools/nakama && docker compose up
```

This starts two containers:

| Service | Image | Ports |
|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 (local only) |
| `nakama` | `heroiclabs/nakama:latest` | 7349 (gRPC), 7350 (game client), 7351 (admin console) |

Server config lives in `tools/nakama/data.yml` (DB address, server key
`defaultkey`, console creds). Data persists in the `postgres-data` volume —
`docker compose down` keeps wallets/leaderboards; add `-v` to wipe.

Wait until the logs show Nakama running (postgres healthcheck gates it).
Admin console: http://127.0.0.1:7351 — default login `admin` / `password`.

To run in the background: `docker compose up -d`. To stop: `docker compose down`.

## 3. Run the proof script

From the repo root (needs the repo's `node_modules` — `npm install` first):

```sh
node tools/nakama/proof-login.js
```

Expected output when the server is up:

```
AshLane Nakama proof — target 127.0.0.1:7350
PASS  device auth — user <uuid>
PASS  wallet round-trip — wrote+read paper=4821
PASS  leaderboard round-trip — submitted+listed score=31415 on "arcade_high_scores"
ALL CHECKS PASSED
```

Expected output when the server is NOT up:

```
AshLane Nakama proof — target 127.0.0.1:7350
FAIL  server not reachable at 127.0.0.1:7350 — is "docker compose up" running in tools/nakama?
      See docs/NAKAMA_SETUP.md for the exact startup steps.
```

(no stack trace — that's by design.)

Override the target with env vars: `NAKAMA_HOST`, `NAKAMA_PORT`, `NAKAMA_KEY`
(the key must match `socket.server_key` in `tools/nakama/data.yml`).

## 4. Point the game at the server

The in-game client (`src/game3d/nakama-client.ts`) defaults to
`127.0.0.1:7350`. For a non-local server, set Vite env vars before build:

```sh
VITE_NAKAMA_HOST=nakama.example.com VITE_NAKAMA_PORT=7350 npm run build
```

(`VITE_NAKAMA_SSL=1` for HTTPS/WSS.)

In code, wire a single connect at boot (e.g. in the game mount / main menu):

```ts
import { connectBackend, awardPaper, backendSubmitScore } from "./game3d/services";

await connectBackend(services);            // resolves "online" or "offline"
await awardPaper(services, 50);            // mission reward
await backendSubmitScore(services, score); // arcade run end
```

## Troubleshooting

- **"server not reachable"** — `docker compose up` isn't running, or ports are
  blocked. Check `docker compose ps` in `tools/nakama`.
- **Auth fails after changing `data.yml`** — the client `serverKey` must match
  `socket.server_key`. Recreate containers: `docker compose down && docker compose up`.
- **Console login fails** — defaults are `admin` / `password` (see `data.yml`).
- **Start from scratch** — `docker compose down -v` wipes the postgres volume.
