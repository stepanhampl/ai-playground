import { test, expect } from '@playwright/test';
import { setup, sendMessage, waitForMessage } from './helpers/index.js';

test('test error shown when API key is invalid', async ({ page }) => {
  // Simulate an invalid OPENROUTER_API_KEY by intercepting the backend call
  // and returning the same error response OpenRouter returns for bad credentials.
  const realKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'dummy_fake_key';

  try {
    await page.route('/api/message', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid API key' }),
      });
    });

    await setup(page);
    await sendMessage(page, 'Hello AI, this is a test.');
    const text = await waitForMessage(page, '.message.error', 1);
    expect(text).toBeTruthy();
  } finally {
    process.env.OPENROUTER_API_KEY = realKey;
  }
});
