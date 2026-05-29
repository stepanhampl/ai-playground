import { test, expect } from '@playwright/test';
import { sendMessageAndWaitFor } from './helpers.js';

test('test multi-turn conversation', async ({ page }) => {
  await page.goto('/');

  // First turn: introduce a fact
  const input = page.locator('#input');
  await expect(input).toBeVisible();
  await input.fill('My name is Alice. Remember this.');
  await page.locator('#send-btn').click();

  // Wait for AI response
  const messagesContainer = page.locator('#messages');
  const deadline1 = Date.now() + 60_000;
  let aiResponse1;
  while (Date.now() < deadline1) {
    const thinking = messagesContainer.locator('.thinking');
    const aiMessage = messagesContainer.locator('.message.ai');
    if (await aiMessage.count() > 0) {
      aiResponse1 = await aiMessage.last().textContent();
      console.log('First AI response:', aiResponse1);
      break;
    }
    if (await thinking.count() === 0) {
      await page.waitForTimeout(500);
      if (await messagesContainer.locator('.message.ai').count() > 0) {
        aiResponse1 = await messagesContainer.locator('.message.ai').last().textContent();
        console.log('First AI response:', aiResponse1);
        break;
      }
    }
    await page.waitForTimeout(1000);
  }
  expect(aiResponse1).toBeTruthy();

  // Second turn: ask about the fact from first turn
  await input.fill('What is my name?');
  await page.locator('#send-btn').click();

  // Wait for second AI response
  const deadline2 = Date.now() + 60_000;
  let aiResponse2;
  while (Date.now() < deadline2) {
    const thinking = messagesContainer.locator('.thinking');
    const aiMessages = messagesContainer.locator('.message.ai');
    if (await aiMessages.count() > 1) {
      // Get the latest AI message (second response)
      aiResponse2 = await aiMessages.last().textContent();
      console.log('Second AI response:', aiResponse2);
      break;
    }
    if (await thinking.count() === 0) {
      await page.waitForTimeout(500);
      if (await messagesContainer.locator('.message.ai').count() > 1) {
        aiResponse2 = await messagesContainer.locator('.message.ai').last().textContent();
        console.log('Second AI response:', aiResponse2);
        break;
      }
    }
    await page.waitForTimeout(1000);
  }
  expect(aiResponse2).toBeTruthy();

  // Verify: the second response should acknowledge "Alice"
  // (case-insensitive, partial match is fine since AI might phrase it differently)
  expect(aiResponse2.toLowerCase()).toContain('alice');
});