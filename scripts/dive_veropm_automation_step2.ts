import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (STEP 2) START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app/automation'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: VeroPM Automation tab not found.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

        // 1. Capture Triggers
        console.log('Opening Triggers...');
        // Find the "Not selected" or button in Trigger section
        const triggerBtn = page.locator('div:has-text("Trigger")').locator('button').first();
        if (await triggerBtn.count() > 0) {
            await triggerBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_automation_triggers.png') });

            const triggers = await page.evaluate(() => {
                const menu = document.querySelector('[role="menu"], [role="listbox"], .dropdown-content');
                return menu ? Array.from(menu.querySelectorAll('div, button, li')).map(el => el.innerText.trim()).filter(Boolean) : [];
            });
            console.log('TRIGGERS:', triggers);
            // Click outside to close
            await page.mouse.click(10, 10);
            await page.waitForTimeout(500);
        }

        // 2. Capture Conditions
        console.log('Opening Conditions...');
        const addConditionBtn = page.getByRole('button', { name: /add condition/i });
        if (await addConditionBtn.count() > 0) {
            await addConditionBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_automation_conditions.png') });

            const conditionFields = await page.evaluate(() => {
                const popover = document.querySelector('[role="dialog"], [role="menu"], .popover');
                return popover ? Array.from(popover.querySelectorAll('div, button, li')).map(el => el.innerText.trim()).filter(Boolean) : [];
            });
            console.log('CONDITION FIELDS:', conditionFields);
            await page.mouse.click(10, 10);
            await page.waitForTimeout(500);
        }

        // 3. Capture Actions
        console.log('Opening Actions...');
        const addActionBtn = page.getByRole('button', { name: /add action/i });
        if (await addActionBtn.count() > 0) {
            await addActionBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_automation_actions.png') });

            const actions = await page.evaluate(() => {
                const popover = document.querySelector('[role="dialog"], [role="menu"], .popover');
                return popover ? Array.from(popover.querySelectorAll('div, button, li')).map(el => el.innerText.trim()).filter(Boolean) : [];
            });
            console.log('ACTIONS:', actions);
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL AUTOMATION ERROR:', err);
    }
}

main();
