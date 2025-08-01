import { expect, test } from "@playwright/test";
import { generateRandomString } from "../utils/test-helpers";

// Use stored authentication
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("Knowledge Bank Management", () => {
  test("should create, edit, and delete a knowledge item", async ({ page }) => {
    await page.goto("/settings/knowledge");
    await page.waitForLoadState("networkidle");

    // Create a new knowledge item
    const content = `Knowledge ${generateRandomString()}`;
    await page.getByRole("button", { name: "Add Knowledge" }).click();
    await page.locator("textarea").fill(content);
    await page.getByRole("button", { name: "Save" }).click();

    // Confirm the new item appears in the list
    const itemButton = page.getByRole("button", { name: content });
    await expect(itemButton).toBeVisible();

    // Edit the knowledge item
    const updatedContent = `${content} updated`;
    await itemButton.click();
    await page.locator("textarea").fill(updatedContent);
    await page.getByRole("button", { name: "Save" }).click();

    // Verify the content updates
    await expect(page.getByRole("button", { name: updatedContent })).toBeVisible();
    await expect(page.getByRole("button", { name: content })).toHaveCount(0);

    // Delete the knowledge item
    const row = page.getByRole("button", { name: updatedContent }).locator("..");
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();

    // Ensure the list refreshes and the item is removed
    await expect(page.getByRole("button", { name: updatedContent })).toHaveCount(0);
  });
});
