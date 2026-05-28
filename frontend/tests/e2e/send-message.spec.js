import { test, expect } from '@playwright/test';

test('test single message', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Wait for the input field to be visible
  const input = page.locator('#input');
  await expect(input).toBeVisible();

  // Type the test message
  await input.fill('Hello AI, this is a test. Answer shortly?');

  // Click the send button
  await page.locator('#send-btn').click();

  // Wait for AI response (either .message.ai appears or .thinking disappears)
  // The thinking indicator has class "thinking" and text "Thinking…"
  // When AI responds, the thinking element is removed and .message.ai appears
  const messagesContainer = page.locator('#messages');

  // Poll for AI response every second, up to 30 seconds
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    // Check if thinking indicator is gone (AI responded)
    const thinking = messagesContainer.locator('.thinking');
    const aiMessage = messagesContainer.locator('.message.ai');

    if (await aiMessage.count() > 0) {
      // AI responded - test passes
      const text = await aiMessage.textContent();
      console.log('AI response:', text);
      return;
    }

    if (await thinking.count() === 0) {
      // Thinking indicator gone but no AI message yet - give it a moment
      await page.waitForTimeout(500);
      if (await aiMessage.count() > 0) {
        const text = await aiMessage.textContent();
        console.log('AI response:', text);
        return;
      }
    }

    // Wait 1 second before polling again
    await page.waitForTimeout(1000);
  }

  // Timeout - no AI response after 30 seconds
  throw new Error('AI did not respond within 30 seconds');
});