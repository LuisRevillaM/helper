import { expect, test } from "@playwright/test";

// Use the working authentication
// Storage state path from existing tests

test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("Chat Settings", () => {
  test("should render code snippet and HMAC secret and persist toggle", async ({ page }) => {
    // Navigate to chat settings
    await page.goto("/settings/in-app-chat");
    await page.waitForLoadState("networkidle");

    // Verify a code block is visible (codeBlock.tsx)
    await expect(page.locator("pre.code").first()).toBeVisible();

    // Expand "Authenticate your users" to reveal HMAC secret input
    await page.getByRole("button", { name: "Authenticate your users" }).click();
    await expect(page.getByLabel("HMAC Secret")).toBeVisible();

    // Toggle "Chat Icon Visibility" switch and confirm persistence after reload
    const switchLocator = page.getByRole("switch", { name: "Chat Icon Visibility Switch" });
    await switchLocator.scrollIntoViewIfNeeded();
    const initialState = await switchLocator.getAttribute("data-state");

    await switchLocator.click();
    // allow debounce + network save
    await page.waitForTimeout(1500);
    await page.waitForLoadState("networkidle");

    await page.reload();
    await page.waitForLoadState("networkidle");

    const reloadedSwitch = page.getByRole("switch", { name: "Chat Icon Visibility Switch" });
    const newState = await reloadedSwitch.getAttribute("data-state");
    expect(newState).not.toBe(initialState);

    // Revert to original state
    await reloadedSwitch.click();
    await page.waitForTimeout(1500);
  });
});
