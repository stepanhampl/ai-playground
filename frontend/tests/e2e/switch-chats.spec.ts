import { test, expect } from '@playwright/test';

test('switching between chats restores messages', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#input');
  const sendBtn = page.locator('#send-btn');
  await expect(input).toBeVisible();

  // First chat: send a unique message
  await input.fill('Reply with the word CAT only.');
  await sendBtn.click();

  // Wait for either AI response or error
  const deadline1 = Date.now() + 30_000;
  let firstChatResolved = false;
  while (Date.now() < deadline1) {
    const aiCount = await page.locator('#messages .message.ai').count();
    const errorCount = await page.locator('#messages .message.error').count();
    const userCount = await page.locator('#messages .message.user').count();
    if (aiCount > 0 || errorCount > 0) { firstChatResolved = true; break; }
    if (userCount > 0) { firstChatResolved = true; break; }
    await page.waitForTimeout(500);
  }
  expect(firstChatResolved).toBe(true);

  // Create a new chat
  await page.locator('#new-chat-btn').click();
  await expect(page.locator('#messages')).toBeEmpty();

  // Second chat: send a different message
  await input.fill('Reply with the word DOG only.');
  await sendBtn.click();

  const deadline2 = Date.now() + 30_000;
  let secondChatResolved = false;
  while (Date.now() < deadline2) {
    const aiCount = await page.locator('#messages .message.ai').count();
    const errorCount = await page.locator('#messages .message.error').count();
    const userCount = await page.locator('#messages .message.user').count();
    if (aiCount > 0 || errorCount > 0) { secondChatResolved = true; break; }
    if (userCount > 0) { secondChatResolved = true; break; }
    await page.waitForTimeout(500);
  }
  expect(secondChatResolved).toBe(true);

  // Now there should be at least 2 chats in the sidebar
  const chatItems = page.locator('.chat-item');
  const chatCount = await chatItems.count();
  expect(chatCount).toBeGreaterThanOrEqual(2);

  // Click the first chat (second-to-last, as newest is at index 0)
  await chatItems.nth(chatCount - 1).click();

  // Wait for messages to be restored
  await page.waitForTimeout(500);

  // Verify the first chat's user message is present
  const messagesText = await page.locator('#messages').textContent();
  expect(messagesText).toContain('CAT');
});