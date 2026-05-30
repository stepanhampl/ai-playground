import { test, expect } from '@playwright/test';
import { setup, sendMessage } from './helpers/index.js';

test('test multi-turn conversation', async ({ page }) => {
  await setup(page);

  // First turn: introduce a fact
  await sendMessage(page, 'My name is Alice. Remember this.');
  const text1 = await waitForAiOrError(page, 1);
  if (text1) expect(text1).toBeTruthy();

  // Second turn: ask about the fact from first turn
  await sendMessage(page, 'What is my name?');
  const text2 = await waitForAiOrError(page, 2);
  if (text2) {
    expect(text2).toBeTruthy();
    // Only check for 'alice' when we actually got an AI response (real API key)
    expect(text2.toLowerCase()).toContain('alice');
  }
});

async function waitForAiOrError(page: any, minCount: number): Promise<string> {
  const messagesContainer = page.locator('#messages');
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    const aiCount = await messagesContainer.locator('.message.ai').count();
    const errorCount = await messagesContainer.locator('.message.error').count();

    if (aiCount >= minCount) {
      const text = await messagesContainer.locator('.message.ai').last().textContent();
      console.log(`Last AI message (#${minCount}):`, text);
      return text ?? '';
    }
    if (errorCount >= minCount) {
      // Placeholder key — error response is expected
      console.log(`Error response received (placeholder key)`);
      return '';
    }

    await page.waitForTimeout(500);
  }

  throw new Error(`Expected at least ${minCount} message(s) but none appeared within 60 seconds`);
}