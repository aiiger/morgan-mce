import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (SUPER RESILIENT) START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;

        console.log('Searching for VeroPM tab among all contexts...');
        for (const context of contexts) {
            const pages = context.pages();
            for (const p of pages) {
                const url = p.url();
                console.log('Found page:', url);
                if (url.includes('veropm.app')) {
                    page = p;
                    break;
                }
            }
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found at all. Is the browser open to veropm.app?');
            process.exit(1);
        }

        console.log('Using page:', page.url());

        // Force navigation to automation if needed
        if (!page.url().includes('automation')) {
            console.log('Navigating to /automation...');
            await page.goto('https://veropm.app/automation', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
        }

        // Ensure we are on the "New Rule" page
        if (!page.url().includes('/new')) {
            console.log('Checking for Create Rule button...');
            const createBtn = page.getByRole('button', { name: /create rule|new rule|add rule/i }).first();
            if (await createBtn.isVisible()) {
                await createBtn.click();
                await page.waitForTimeout(3000);
            }
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        const report = { triggers: [], conditions: [], actions: [] };

        // 1. Triggers
        console.log('Extracting Triggers...');
        const possibleTriggerBtns = [
            page.locator('button:has-text("Task Status Changed")'),
            page.locator('div:has-text("Trigger") + div button'),
            page.locator('.select-trigger').first()
        ];

        for (const btn of possibleTriggerBtns) {
            if (await btn.isVisible()) {
                await btn.click();
                await page.waitForTimeout(1500);
                report.triggers = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], .select-item, .command-item'))
                        .map(el => el.innerText.trim())
                        .filter(t => t.length > 2 && !t.includes('\n'));
                });
                console.log('Triggers Found:', report.triggers.length);
                await page.keyboard.press('Escape');
                break;
            }
        }

        // 2. Conditions
        console.log('Extracting Conditions...');
        const addConditionBtn = page.getByRole('button', { name: /add condition/i }).first();
        if (await addConditionBtn.isVisible()) {
            await addConditionBtn.click();
            await page.waitForTimeout(1500);
            report.conditions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[role="dialog"] button, [role="menu"] button, .popover-content button, .command-item'))
                    .map(el => el.innerText.trim())
                    .filter(t => t.length > 2);
            });
            console.log('Conditions Found:', report.conditions.length);
            await page.keyboard.press('Escape');
        }

        // 3. Actions
        console.log('Extracting Actions...');
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1000);
        const addActionBtn = page.getByRole('button', { name: /add action/i }).first();
        if (await addActionBtn.isVisible()) {
            await addActionBtn.click();
            await page.waitForTimeout(1500);
            report.actions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[role="dialog"] button, [role="menu"] button, .popover-content button, .command-item'))
                    .map(el => el.innerText.trim())
                    .filter(t => t.length > 2);
            });
            console.log('Actions Found:', report.actions.length);
            await page.keyboard.press('Escape');
        }

        fs.writeFileSync(path.join(artifactDir, 'veropm_automation_deep_dive.json'), JSON.stringify(report, null, 2));
        console.log('Final Report Saved.');

        await browser.close();
    } catch (err) {
        console.error('FATAL SYSTEM ERROR:', err);
    }
}

main();
