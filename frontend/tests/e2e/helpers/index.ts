import { expect, Page } from '@playwright/test';

export async function setup(page: Page): Promise<void> {
  await page.goto('/');
}

export async function sendMessage(page: Page, message: string): Promise<void> {
  const input = page.locator('#input');
  await expect(input).toBeVisible();
  await input.fill(message);
  await page.locator('#send-btn').click();
}

/**
 * Polls #messages until at least `minCount` elements matching `locatorClass` exist,
 * then returns the text content of the last matching element.
 * Polls every 500ms (1000ms while a `.thinking` indicator is visible).
 * Throws if the condition is not met within 60 seconds.
 */
export async function waitForMessage(page: Page, locatorClass: string, minCount: number): Promise<string> {
  const messagesContainer = page.locator('#messages');
  const resultLocator = messagesContainer.locator(locatorClass);

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await resultLocator.count() >= minCount) {
      const text = await resultLocator.last().textContent();
      console.log(`Last (#${minCount}) message (${locatorClass}):`, text);
      return text ?? '';
    }

    const hasThinking = (await messagesContainer.locator('.thinking').count()) > 0;
    await page.waitForTimeout(hasThinking ? 1000 : 500);
  }

  throw new Error(`Expected at least ${minCount} element(s) matching "${locatorClass}" but none appeared within 60 seconds`);
}
