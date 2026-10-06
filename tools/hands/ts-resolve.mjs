// ts-resolve.mjs — resolve vite-style extensionless relative imports under
// node --experimental-strip-types (test-only).
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
// Modules that read vite's import.meta.env (or other browser-only globals) at
// import time get redirected to node-safe stubs for tests.
const STUBS = {
  "asset-base": join(HERE, "stubs", "asset-base.stub.mjs"),
};

export async function resolve(spec, ctx, next) {
  const base = spec.split("/").pop();
  if (STUBS[base] && (spec.startsWith("./") || spec.startsWith("../"))) {
    return { url: "file://" + STUBS[base], shortCircuit: true };
  }
  try {
    return await next(spec, ctx);
  } catch (e) {
    if (spec.startsWith("./") || spec.startsWith("../")) {
      for (const ext of [".ts", ".tsx", "/index.ts"]) {
        const url = new URL(spec + ext, ctx.parentURL).href;
        if (existsSync(new URL(url))) return { url, shortCircuit: true };
      }
    }
    throw e;
  }
}
