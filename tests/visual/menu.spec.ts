/**
 * tests/visual/menu.spec.ts — visual regression: main menu.
 *
 * Baseline flow:
 *   npx playwright test --config tests/visual/playwright.config.ts --update-snapshots
 */
import { test, expect } from "@playwright/test";

test("main menu renders", async ({ page }) => {
  await page.goto("http://localhost:4173/");
  // Wait for the app to signal it's painted (or fall back to network idle).
  await page
    .waitForFunction(
      () =>
        (window as unknown as Record<string, unknown>)
          .__ASHLANE_SCENE_READY__ === true,
      null,
      { timeout: 60_000 },
    )
    .catch(() => page.waitForLoadState("networkidle"));
  await expect(page).toHaveScreenshot("menu.png", {
    maxDiffPixels: 500,
    animations: "disabled",
  });
});
