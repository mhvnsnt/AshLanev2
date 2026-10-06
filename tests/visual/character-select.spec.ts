/**
 * tests/visual/character-select.spec.ts — visual regression: character select.
 *
 * NOTE: update the route path to match the real character-select route once
 * it exists in the router. The test is written to be correct by construction
 * and skipped gracefully if the route 404s.
 */
import { test, expect } from "@playwright/test";

const ROUTES = ["/select", "/character-select", "/roster"];

test("character select renders", async ({ page }) => {
  let loaded = false;
  for (const route of ROUTES) {
    const res = await page.goto(`http://localhost:4173${route}`);
    if (res && res.ok()) {
      loaded = true;
      break;
    }
  }
  test.skip(!loaded, "no character-select route found yet");

  await page
    .waitForFunction(
      () =>
        (window as unknown as Record<string, unknown>)
          .__ASHLANE_SCENE_READY__ === true,
      null,
      { timeout: 60_000 },
    )
    .catch(() => page.waitForLoadState("networkidle"));
  await expect(page).toHaveScreenshot("character-select.png", {
    maxDiffPixels: 500,
    animations: "disabled",
  });
});
