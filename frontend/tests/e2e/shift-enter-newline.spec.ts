import { test, expect } from '@playwright/test';
import { setup } from './helpers/index.js';

test('Shift+Enter adds newline instead of sending', async ({ page }) => {
  await setup(page);

  const input = page.locator('#input');
  await expect(input).toBeVisible();

  // Fill the textarea and press Shift+Enter
  await input.fill('This should not be sent yet');
  await input.press('Shift+Enter');

  // Give a moment for any message to appear
  await page.waitForTimeout(500);

  // Verify message is NOT sent — no user message in #messages yet
  const messagesContainer = page.locator('#messages');
  const messagesText = await messagesContainer.textContent();
  expect(messagesText ?? '').not.toContain('This should not be sent yet');

  // Verify the textarea still has the newline (value contains newline character)
  const inputValue = await input.inputValue();
  expect(inputValue).toContain('\n');
});