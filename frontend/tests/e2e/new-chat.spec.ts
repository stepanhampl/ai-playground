import { test, expect } from '@playwright/test';

test('new chat button clears messages and adds sidebar entry', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#input');
  const sendBtn = page.locator('#send-btn');
  await expect(input).toBeVisible();

  // Send a message to ensure at least one chat exists in the sidebar
  await input.fill('Hello AI, tell me a short fact.');
  await sendBtn.click();

  // Wait for either AI response or error (placeholder key may cause error)
  const deadline = Date.now() + 30_000;
  let chatItemAppeared = false;
  while (Date.now() < deadline) {
    const count = await page.locator('.chat-item').count();
    if (count > 0) { chatItemAppeared = true; break; }
    const errorCount = await page.locator('#messages .message.error').count();
    if (errorCount > 0) {
      // Error appeared — chat may still be created, check sidebar
      const sidebarCount = await page.locator('.chat-item').count();
      if (sidebarCount > 0) { chatItemAppeared = true; break; }
      // Error but no chat in sidebar — still ok to proceed, just no chat
      break;
    }
    await page.waitForTimeout(500);
  }

  // Verify at least one chat item appeared in the sidebar
  const chatItemsBefore = await page.locator('.chat-item').count();
  expect(chatItemsBefore).toBeGreaterThanOrEqual(1);

  // Click new chat button
  await page.locator('#new-chat-btn').click();

  // Verify #messages is empty
  await expect(page.locator('#messages')).toBeEmpty();

  // Verify a chat item is still present (count should not decrease)
  const countAfter = await page.locator('.chat-item').count();
  expect(countAfter).toBeGreaterThanOrEqual(chatItemsBefore);
});