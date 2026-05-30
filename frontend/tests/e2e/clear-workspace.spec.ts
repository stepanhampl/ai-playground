import { test, expect } from '@playwright/test';
import { writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceDir = __dirname.endsWith('frontend/tests/e2e')
    ? resolve(__dirname, '../../../workspace')
    : resolve(__dirname, 'workspace');

test('clear workspace button deletes everything in workspace besides .gitkeep', async ({ page }) => {
    // Create example.txt in the local workspace directory
    writeFileSync(resolve(workspaceDir, '37e93528-2e68-493e-b72c-330c902ced4c.txt'), '');

    await page.goto('/');

    const clearBtn = page.locator('#clear-workspace-btn');
    await expect(clearBtn).toBeVisible();

    // Click and accept the confirm dialog, wait for the API call to complete
    page.on('dialog', dialog => dialog.accept());
    const responsePromise = page.waitForResponse('**/api/clear-workspace');
    await clearBtn.click();
    await responsePromise;

    // Verify workspace/ contains only .gitkeep
    const files = readdirSync(workspaceDir);
    expect(files).toEqual(['.gitkeep']);
});
