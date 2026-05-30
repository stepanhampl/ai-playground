import { test, expect } from '@playwright/test';
import { setup, sendMessage, waitForResponseOrError } from './helpers';

test('send and button is disabled while waiting for response', async ({ page }) => {
  await setup(page);

  const sendBtn = page.locator('#send-btn');
  await sendMessage(page, 'Tell me a very short joke.');

  // Immediately after click, the button should be disabled
  await expect(sendBtn).toBeDisabled();

  await waitForResponseOrError(page);

  // Button should be re-enabled
  await expect(sendBtn).toBeEnabled();
});
