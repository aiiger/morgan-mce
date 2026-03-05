import { test, expect } from '@playwright/test';

test.describe('MCE System E2E Data Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'attached', timeout: 10000 });
  });

  test('Project Form opens from dashboard', async ({ page }) => {
    await page.waitForSelector('header', { timeout: 10000 });

    const newProjectButton = page.getByRole('button', { name: /New Project/i }).first();
    await expect(newProjectButton).toBeVisible({ timeout: 10000 });
    await newProjectButton.click();

    await expect(page.getByText('Basic Information')).toBeVisible({ timeout: 10000 });

    // Close form
    await page.getByRole('button', { name: /Back/i }).click();
  });

  test('Navigate to Projects view', async ({ page }) => {
    await page.waitForSelector('aside', { timeout: 10000 });
    await page.getByRole('button', { name: /Projects/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/projects found/i)).toBeVisible();
  });

});
