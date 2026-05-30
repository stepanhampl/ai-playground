import { test, expect } from '@playwright/test';

test('send button disabled while waiting for response', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#input');
  const sendBtn = page.locator('#send-btn');
  await expect(input).toBeVisible();
  await expect(sendBtn).toBeVisible();

  // Fill and click send
  await input.fill('Tell me a very short joke.');
  await sendBtn.click();

  // Immediately after click, the button should be disabled
  const isDisabledImmediately = await sendBtn.isDisabled();
  expect(isDisabledImmediately).toBe(true);

  // Wait for either AI response OR error response (placeholder key returns error)
  const deadline = Date.now() + 30_000;
  let resolved = false;
  while (Date.now() < deadline) {
    const isDisabled = await sendBtn.isDisabled();
    if (!isDisabled) { resolved = true; break; }
    // Also check if error message appeared
    const errorCount = await page.locator('#messages .message.error').count();
    if (errorCount > 0) { resolved = true; break; }
    await page.waitForTimeout(500);
  }
  expect(resolved).toBe(true);

  // Button should be re-enabled
  const isDisabledAfter = await sendBtn.isDisabled();
  expect(isDisabledAfter).toBe(false);
});