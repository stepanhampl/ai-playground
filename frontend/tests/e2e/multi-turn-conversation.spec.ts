import { test, expect } from '@playwright/test';
import { setup, sendMessage, waitForMessage } from './helpers/index.js';

test('test multi-turn conversation', async ({ page }) => {
  await setup(page);

  // First turn: introduce a fact
  await sendMessage(page, 'My name is Alice. Remember this.');
  const aiResponse1 = await waitForMessage(page, '.message.ai', 1);
  expect(aiResponse1).toBeTruthy();

  // Second turn: ask about the fact from first turn
  await sendMessage(page, 'What is my name?');
  const aiResponse2 = await waitForMessage(page, '.message.ai', 2);
  expect(aiResponse2).toBeTruthy();

  // Verify the second response acknowledges "Alice"
  expect(aiResponse2.toLowerCase()).toContain('alice');
});
