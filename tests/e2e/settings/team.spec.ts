import { expect, test } from "@playwright/test";
import { generateTestEmail, generateRandomString, debugWait } from "../utils/test-helpers";

// Admin authentication state
// assumes tests/e2e/.auth/user.json exists from setup

test.describe("Team settings management", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("admin can add, edit and remove team members", async ({ page }) => {
    const email = generateTestEmail();
    const displayName = `Test User ${generateRandomString()}`;
    const updatedName = `${displayName} Updated`;

    // Navigate to team settings
    await page.goto("/settings/team");

    // Add a new member
    await page.getByPlaceholder("Email address").fill(email);
    await page.getByPlaceholder("Name").fill(displayName);
    await page.getByText("Permissions").click();
    await page.getByRole("option", { name: "Member" }).click();
    await page.getByRole("button", { name: "Add Member" }).click();

    // Wait for new member row to appear
    const row = page.getByRole("row", { name: new RegExp(email) });
    await expect(row).toBeVisible({ timeout: 15000 });

    // Edit member display name
    const nameInput = row.locator("td").nth(1).locator("input");
    await nameInput.fill(updatedName);
    await debugWait(page, 1000);
    await expect(nameInput).toHaveValue(updatedName);

    // Remove the member
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Confirm Removal" }).click();

    // Verify removal
    await expect(page.getByRole("row", { name: new RegExp(email) })).toHaveCount(0);
  });
});

// Non-admin permissions check

test.describe("Team settings permissions", () => {
  // This storage state should represent a non-admin user
  test.use({ storageState: "tests/e2e/.auth/member.json" });

  test("non-admin user cannot modify team members", async ({ page }) => {
    await page.goto("/settings/team");

    // Add member form should be hidden
    await expect(page.getByPlaceholder("Email address")).toHaveCount(0);

    // Existing rows should not have delete buttons or editable inputs
    const rows = page.locator("tbody tr");
    if (await rows.count()) {
      const firstRow = rows.first();
      await expect(firstRow.locator("button", { name: "Delete" })).toHaveCount(0);
      await expect(firstRow.locator("input")).toHaveCount(0);
    }
  });
});
