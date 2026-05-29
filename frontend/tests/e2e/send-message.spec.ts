import { test, expect } from '@playwright/test';
import { setup, sendMessage, waitForMessage } from './helpers/index.js';

test('test single message', async ({ page }) => {
  await setup(page);
  await sendMessage(page, 'Hello AI, this is a test. Answer shortly?');
  const text = await waitForMessage(page, '.message.ai', 1);
  expect(text).toBeTruthy();
});
