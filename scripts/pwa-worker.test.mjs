import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import testRunner from "node:test";

const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

testRunner("install guide never overwrites the cached game shell", () => {
  assert.match(worker, /url\.pathname === "\/" && !url\.searchParams\.has\("install"\)/);
});

testRunner("service worker excludes auth and API routes from caching", () => {
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /url\.pathname\.startsWith\("\/auth\/"\)/);
});
