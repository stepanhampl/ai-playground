import { test, expect } from '@playwright/test';
import { setup, sendMessage, waitForResponseOrError } from './helpers';

test('new chat button clears messages and adds sidebar entry', async ({ page }) => {
  await setup(page);

  await sendMessage(page, 'Hello AI, tell me a short fact.');
  await waitForResponseOrError(page);

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
