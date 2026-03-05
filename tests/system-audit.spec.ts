import { test, expect } from '@playwright/test';

test('System Integrity Audit', async ({ page }) => {
  const errors: string[] = [];
  const brokenButtons: string[] = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('Failed to load resource') || !text.includes('404')) {
        errors.push(`Console Error: ${text}`);
      }
    }
  });

  // Capture failed network requests (404)
  page.on('response', async (response) => {
    if (response.status() === 404) {
      const url = response.url();
      errors.push(`404: ${url}`);
    }
  });

  // Capture page crashes
  page.on('pageerror', error => {
    errors.push(`Page Crash: ${error.message}`);
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('body', { timeout: 10000 });

  await page.waitForSelector('aside', { timeout: 10000 });
  await page.screenshot({ path: 'audit-debug.png', fullPage: true });
  
  console.log(`Auditing Page: "${await page.title()}"`);
  console.log(`URL: ${page.url()}`);

  // 1. Audit Navigation & Controls
  // Find all clickable items in the view
  const clickableItems = await page.locator('button, [role="button"], a').all();
  console.log(`Auditing ${clickableItems.length} interactive elements...`);

  for (const button of clickableItems.slice(0, 50)) { // Limit to first 50 for safety
    const label = (await button.innerText() || await button.getAttribute('aria-label') || 'unlabeled').trim().split('\n')[0];
    const isVisible = await button.isVisible();
    const isEnabled = await button.isEnabled();
    const normalizedLabel = label.toLowerCase();
    if (!isVisible || !isEnabled || label === '' || normalizedLabel.includes('open next.js dev tools') || normalizedLabel === 'settings') continue;

    console.log(`   - Testing component: [${label}]`);
    try {
      await button.click({ timeout: 1500 });
      await page.waitForTimeout(400); // Wait for transition
      
      // Check if page crashed after click
      const bodyText = await page.innerText('body');
      if (bodyText.includes('System Variance Detected') || bodyText.includes('error')) {
        errors.push(`Logic Error: Navigating to [${label}] triggered an error boundary/message.`);
      }
    } catch (e) {
      brokenButtons.push(`Element [${label.substring(0, 15)}] failed to respond`);
    }
  }

  // 2. Audit Main Content Buttons
  const mainButtons = await page.locator('main button, .page-container button').all();
  console.log(`Auditing ${mainButtons.length} functional buttons...`);

  for (const button of mainButtons.slice(0, 20)) { // Sample first 20 to avoid infinite loops
    const text = await button.innerText() || 'icon-button';
    try {
      await button.click({ timeout: 1000 });
      await page.waitForTimeout(300);
    } catch (e) {
      // Buttons might be disabled or hidden, which is fine
    }
  }

  console.log('\n--- FUNCTIONAL INTEGRITY RESULTS ---');
  if (errors.length === 0 && brokenButtons.length === 0) {
    console.log('✅ No immediate crashes or console errors detected during crawl.');
  } else {
    errors.forEach(err => console.log(`❌ ${err}`));
    brokenButtons.forEach(btn => console.log(`⚠️ ${btn}`));
  }
});
