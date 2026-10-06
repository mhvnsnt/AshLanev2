#!/usr/bin/env node
/**
 * tools/nakama/proof-login.js — AshLane Nakama proof script.
 *
 * Run AFTER the server is up:
 *   cd tools/nakama && docker compose up
 *   node tools/nakama/proof-login.js
 *
 * What it proves:
 *   1. Device-ID auth against the Nakama server (account auto-created).
 *   2. Wallet write + read round-trip (street cash storage object).
 *   3. Leaderboard submit + read round-trip (arcade_high_scores).
 *
 * Prints PASS/FAIL per step and exits 0 on success, 1 on failure.
 * If the server is down it prints a clear "not reachable" message —
 * never a stack trace.
 *
 * Env overrides: NAKAMA_HOST (default 127.0.0.1), NAKAMA_PORT (default 7350),
 *                NAKAMA_KEY (default "defaultkey", must match data.yml).
 */

import { Client } from "@heroiclabs/nakama-js";

const HOST = process.env.NAKAMA_HOST || "127.0.0.1";
const PORT = process.env.NAKAMA_PORT || "7350";
const KEY = process.env.NAKAMA_KEY || "defaultkey";
const TARGET = `${HOST}:${PORT}`;

const WALLET_COLLECTION = "wallet";
const WALLET_KEY = "proof-login";
const LEADERBOARD_ID = "arcade_high_scores";

function fail(step, detail) {
  console.log(`FAIL  ${step}${detail ? " — " + detail : ""}`);
  process.exit(1);
}

function pass(step, detail) {
  console.log(`PASS  ${step}${detail ? " — " + detail : ""}`);
}

function unreachableHint(err) {
  const msg = String((err && err.message) || err || "");
  const code = String((err && err.code) || "");
  return /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EHOSTUNREACH|network/i.test(msg + code);
}

async function main() {
  console.log(`AshLane Nakama proof — target ${TARGET}`);

  const client = new Client(KEY, HOST, PORT, false, 8000);
  const deviceId = `proof-login-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)}`;

  // 1. Device-ID auth.
  let session;
  try {
    session = await client.authenticateDevice(deviceId, true);
  } catch (err) {
    if (unreachableHint(err)) {
      console.log(
        `FAIL  server not reachable at ${TARGET} — is "docker compose up" running in tools/nakama?`,
      );
      console.log("      See docs/NAKAMA_SETUP.md for the exact startup steps.");
      process.exit(1);
    }
    fail("device auth", String((err && err.message) || err));
  }
  pass("device auth", `user ${session.user_id}`);

  // 2. Wallet write + read round-trip.
  const expectedPaper = 1000 + Math.floor(Math.random() * 9000);
  try {
    await client.writeStorageObjects(session, [
      {
        collection: WALLET_COLLECTION,
        key: WALLET_KEY,
        value: { paper: expectedPaper },
        permission_read: 1,
        permission_write: 1,
      },
    ]);
    const read = await client.readStorageObjects(session, {
      object_ids: [{ collection: WALLET_COLLECTION, key: WALLET_KEY }],
    });
    const got = read.objects && read.objects[0] && read.objects[0].value
      ? read.objects[0].value.paper
      : undefined;
    if (got !== expectedPaper) {
      fail("wallet round-trip", `wrote ${expectedPaper}, read back ${JSON.stringify(got)}`);
    }
  } catch (err) {
    fail("wallet round-trip", String((err && err.message) || err));
  }
  pass("wallet round-trip", `wrote+read paper=${expectedPaper}`);

  // 3. Leaderboard submit + read round-trip.
  const score = 5000 + Math.floor(Math.random() * 50000);
  try {
    await client.writeLeaderboardRecord(session, LEADERBOARD_ID, { score: String(score) });
    const list = await client.listLeaderboardRecords(session, LEADERBOARD_ID, undefined, 10);
    const mine = (list.records || []).find((r) => r.owner_id === session.user_id);
    if (!mine) {
      fail("leaderboard round-trip", "submitted record not found in listing");
    }
    if (Number(mine.score) !== score) {
      fail("leaderboard round-trip", `wrote ${score}, listed ${mine.score}`);
    }
  } catch (err) {
    fail("leaderboard round-trip", String((err && err.message) || err));
  }
  pass("leaderboard round-trip", `submitted+listed score=${score} on "${LEADERBOARD_ID}"`);

  console.log("ALL CHECKS PASSED");
  process.exit(0);
}

main().catch((err) => {
  if (unreachableHint(err)) {
    console.log(
      `FAIL  server not reachable at ${TARGET} — is "docker compose up" running in tools/nakama?`,
    );
  } else {
    console.log(`FAIL  unexpected error — ${String((err && err.message) || err)}`);
  }
  process.exit(1);
});
