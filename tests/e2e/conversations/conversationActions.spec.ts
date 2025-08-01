import { expect, test } from "@playwright/test";
import { generateRandomString } from "../utils/test-helpers";

// Use stored auth state for all tests in this file
test.use({ storageState: "tests/e2e/.auth/user.json" });

const CONVERSATION_LINK = 'a[href*="/conversations?id="]';
const EDITOR = '[role="textbox"][contenteditable="true"]';
const COMMAND_INPUT = 'input[placeholder="Type a command..."]';

async function openFirstConversation(page) {
  await page.goto("/mine");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector(CONVERSATION_LINK);
  await page.locator(CONVERSATION_LINK).first().click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(EDITOR)).toBeVisible();
}

async function openCommandBar(page) {
  await page.locator(EDITOR).click();
  await page.keyboard.press("/");
  const input = page.locator(COMMAND_INPUT);
  await expect(input).toBeVisible();
  return input;
}

test.describe("Conversation actions", () => {
  test("reply, status changes, notes, drafts and cc/bcc", async ({ page }) => {
    await openFirstConversation(page);

    const replyText = `Reply ${generateRandomString()}`;
    const editor = page.locator(EDITOR);

    // Send a reply and ensure it appears in the thread
    await editor.click();
    await page.keyboard.type(replyText);
    await page.locator('button:has-text("Reply")').click();
    await expect(page.locator(`[data-message-item] :text("${replyText}")`)).toBeVisible();

    // Close and reopen the conversation
    await page.locator('button:has-text("Close")').click();
    await expect(page.locator('button:has-text("Reopen")')).toBeVisible();
    await page.locator('button:has-text("Reopen")').click();
    await expect(page.locator('button:has-text("Close")')).toBeVisible();

    // Add an internal note
    const noteText = `Note ${generateRandomString()}`;
    let commandInput = await openCommandBar(page);
    await commandInput.fill("internal note");
    await page.locator('[cmdk-item][data-value="add-note"], text="Add internal note"').click();
    const noteArea = page.locator('textarea[placeholder="Type your note here..."]');
    await expect(noteArea).toBeVisible();
    await noteArea.fill(noteText);
    await page.locator('button:has-text("Add internal note")').click();
    await expect(page.locator(`[data-message-item][data-type="note"] :text("${noteText}")`)).toBeVisible();

    // Generate a draft
    commandInput = await openCommandBar(page);
    await commandInput.fill("generate draft");
    await page.locator('[cmdk-item][data-value="generate-draft"], text="Generate draft"').click();
    await expect(editor).not.toHaveText("", { timeout: 15000 });

    // Toggle CC/BCC fields and send message with addresses
    commandInput = await openCommandBar(page);
    await commandInput.fill("Add CC or BCC");
    await page.locator('[cmdk-item][data-value="toggle-cc-bcc"], text="Add CC or BCC"').click();
    const ccInput = page.locator('input[name="CC"]');
    const bccInput = page.locator('input[name="BCC"]');
    await expect(ccInput).toBeVisible();
    await ccInput.fill("cc@example.com");
    await expect(bccInput).toBeVisible();
    await bccInput.fill("bcc@example.com");

    await page.locator('button:has-text("Reply")').click();
    await expect(page.locator('[data-message-item] >> text="cc@example.com"')).toBeVisible();
    await expect(page.locator('[data-message-item] >> text="bcc@example.com"')).toBeVisible();
  });
});
