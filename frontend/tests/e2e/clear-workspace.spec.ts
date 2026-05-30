import { test, expect } from '@playwright/test';
import { writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('clear workspace button deletes everything in workspace besides .gitkeep', async ({ page }) => {
  // Create example.txt in the local workspace directory
  writeFileSync(resolve(__dirname, '../../../workspace/37e93528-2e68-493e-b72c-330c902ced4c.txt'), '');

  await page.goto('/');

  const clearBtn = page.locator('#clear-workspace-btn');
  await expect(clearBtn).toBeVisible();

  // Click and accept the confirm dialog
  page.on('dialog', dialog => dialog.accept());
  await clearBtn.click();

  // Verify workspace/ contains only .gitkeep
  const files = readdirSync(resolve(__dirname, '../../../workspace'));
  expect(files).toEqual(['.gitkeep']);
});
