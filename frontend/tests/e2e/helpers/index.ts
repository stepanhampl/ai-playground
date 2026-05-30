import { expect, type Page } from '@playwright/test';

export async function setup(page: Page): Promise<void> {
  // Use domcontentloaded to avoid waiting for async SPA initialization (API calls
  // triggered on page load). This is more resilient when tests run in sequence under
  // load from the full suite — page.goto('/') with default 'load' times out because
  // the SPA's init fetch (chats, messages) is slow when the server is busy.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // Wait for the app to be fully initialized before proceeding.
  await page.waitForSelector('#input', { timeout: 60_000 });
  await page.request.post('/api/reset');
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
export async function waitForResponseOrError(page: Page): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const isDisabled = await page.locator('#send-btn').isDisabled();
    if (!isDisabled) return;
    const errorCount = await page.locator('#messages .message.error').count();
    if (errorCount > 0) return;
    await page.waitForTimeout(500);
  }
}

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
