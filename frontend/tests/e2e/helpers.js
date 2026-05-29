import { expect } from '@playwright/test';

export async function sendMessageAndWaitFor(page, message, resultLocatorClass) {
  await page.goto('/');

  const input = page.locator('#input');
  await expect(input).toBeVisible();

  await input.fill(message);
  await page.locator('#send-btn').click();

  const messagesContainer = page.locator('#messages');
  const resultLocator = messagesContainer.locator(resultLocatorClass);

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await resultLocator.count() > 0) {
      const text = await resultLocator.textContent();
      console.log(`Response (${resultLocatorClass}):`, text);
      return text;
    }

    const thinking = messagesContainer.locator('.thinking');
    if (await thinking.count() === 0) {
      await page.waitForTimeout(500);
      if (await resultLocator.count() > 0) {
        const text = await resultLocator.textContent();
        console.log(`Response (${resultLocatorClass}):`, text);
        return text;
      }
    }

    await page.waitForTimeout(1000);
  }

  throw new Error(`No element matching "${resultLocatorClass}" appeared within 60 seconds`);
}
