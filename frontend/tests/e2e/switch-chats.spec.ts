import { test, expect } from '@playwright/test';
import { setup, sendMessage, waitForMessage } from './helpers';

test('switching between chats restores messages', async ({ page }) => {
  await setup(page);

  await sendMessage(page, 'Reply with the word CAT only.');
  await waitForMessage(page, '.message.ai', 1);

  await page.locator('#new-chat-btn').click();
  await expect(page.locator('#messages')).toBeEmpty();

  await sendMessage(page, 'Reply with the word DOG only.');
  await waitForMessage(page, '.message.ai', 1);

  const chatItems = page.locator('.chat-item');
  const chatCount = await chatItems.count();
  expect(chatCount).toBeGreaterThanOrEqual(2);

  await chatItems.nth(2).click();
  
  await expect(page.locator('#messages')).toContainText('CAT');
});
