import { test, expect } from '@playwright/test';
import { sendMessageAndWaitFor } from './helpers.js';

test('test single message', async ({ page }) => {
  const text = await sendMessageAndWaitFor(page, 'Hello AI, this is a test. Answer shortly?', '.message.ai');
  expect(text).toBeTruthy();
});
