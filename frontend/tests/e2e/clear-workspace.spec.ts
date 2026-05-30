import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const CONTAINER_NAME = 'ai-playground-frontend';

test('clear workspace button deletes everything in workspace besides .gitkeep', async ({ page }) => {
  // Create example.txt in the workspace via docker exec
  execSync(`docker exec ${CONTAINER_NAME} touch /workspace/example.txt`, { stdio: 'pipe' });

  await page.goto('/');

  const clearBtn = page.locator('#clear-workspace-btn');
  await expect(clearBtn).toBeVisible();

  // Click and accept the confirm dialog
  page.on('dialog', dialog => dialog.accept());
  await clearBtn.click();

  // Verify workspace/ contains only .gitkeep
  const output = execSync(
    `docker exec ${CONTAINER_NAME} ls -a /workspace`,
    { encoding: 'utf8', stdio: 'pipe' }
  );

  const files = output.split('\n').filter(f => f.trim() !== '' && f !== '.' && f !== '..');
  expect(files).toEqual(['.gitkeep']);
});