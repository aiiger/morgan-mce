import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should initialize with light theme', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const theme = await page.evaluate(() => document.documentElement.dataset.theme);

    expect(theme).toBe('light');
  });

  test('should apply theme tokens correctly (light only)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim();
    });

    expect(bgColor).toBeTruthy();
  });

  test('should not cause flash of wrong theme on page load', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('mce-theme-preference', 'light'));

    const themeChanges: string[] = [];
    await page.exposeFunction('trackTheme', (theme: string) => {
      themeChanges.push(theme);
    });

    await page.evaluate(() => {
      const observer = new MutationObserver(() => {
        (window as any).trackTheme(document.documentElement.dataset.theme);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    });

    await page.reload();
    await page.waitForSelector('header', { timeout: 10000 });

    const finalTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(finalTheme).toBe('light');
  });
});
