/**
 * tests/visual/playwright.config.ts
 *
 * Visual regression testing for AshLane 3D scenes.
 * Tool: Playwright (Apache-2.0, https://playwright.dev).
 *
 * How it works:
 *   1. `npx playwright test --update-snapshots` on a known-good build → writes baselines
 *   2. Future runs diff against baselines; failures surface as pixel diffs
 *   3. The game sets `window.__ASHLANE_SCENE_READY__ = true` once a scene has
 *      rendered its first fully-loaded frame — tests wait on that flag.
 *
 * Determinism rules (fight GPU flake):
 *   - fixed viewport + deviceScaleFactor: 1
 *   - animations: 'disabled' freezes CSS/rAF-driven UI chrome
 *   - 3D scene baselines are generated in CI (same OS/GPU stack)
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__snapshots__/{arg}{ext}",
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    ...devices["Desktop Chrome"],
    deviceScaleFactor: 1,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    // Vite preview of the production build (TanStack Start output).
    command: "npm run preview -- --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
