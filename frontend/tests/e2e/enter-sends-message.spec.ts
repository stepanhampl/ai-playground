import { test, expect } from '@playwright/test';
import { setup } from './helpers/index.js';

test('Enter key sends message', async ({ page }) => {
  await setup(page);

  const input = page.locator('#input');
  await expect(input).toBeVisible();

  // Fill the textarea and press Enter (not Shift+Enter)
  await input.fill('Testing Enter key sends message');
  await input.press('Enter');

  // Verify user message appears in #messages
  const messagesContainer = page.locator('#messages');
  await page.waitForTimeout(500);
  const messagesText = await messagesContainer.textContent();
  expect(messagesText).toContain('Testing Enter key sends message');
});