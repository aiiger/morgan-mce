import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (FINAL EXTRACTION) START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app/automation'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: VeroPM tab not found on automation page.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

        // 1. Get Triggers
        console.log('1. Extacting Triggers...');
        const triggerSelector = 'div:has-text("Trigger") + div button, .select-trigger'; // Heuristic
        const triggerBtn = page.locator('button:has-text("Task Status Changed")').first();
        if (await triggerBtn.isVisible()) {
            await triggerBtn.click();
            await page.waitForTimeout(1000);
            const triggers = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], .select-item'))
                    .map(el => el.innerText.trim());
            });
            console.log('Triggers:', triggers);
            fs.writeFileSync(path.join(artifactDir, 'veropm_triggers.json'), JSON.stringify(triggers, null, 2));
            await page.keyboard.press('Escape');
        }

        // 2. Get Conditions
        console.log('2. Extracting Conditions...');
        const addConditionBtn = page.getByRole('button', { name: 'Add Condition', exact: true }).first();
        if (await addConditionBtn.isVisible()) {
            await addConditionBtn.click();
            await page.waitForTimeout(1000);
            const conditions = await page.evaluate(() => {
                const results = [];
                // Look for the open popover/dropdown
                const items = document.querySelectorAll('[role="dialog"] button, [role="menu"] button, .popover-content button');
                items.forEach(el => results.push(el.innerText.trim()));
                return results;
            });
            console.log('Conditions:', conditions);
            fs.writeFileSync(path.join(artifactDir, 'veropm_conditions.json'), JSON.stringify(conditions, null, 2));
            await page.keyboard.press('Escape');
        }

        // 3. Scroll to Actions
        console.log('3. Extracting Actions...');
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(500);

        const addActionBtn = page.getByRole('button', { name: 'Add Action', exact: true }).first();
        if (await addActionBtn.isVisible()) {
            await addActionBtn.click();
            await page.waitForTimeout(1000);
            const actions = await page.evaluate(() => {
                const results = [];
                const items = document.querySelectorAll('[role="dialog"] button, [role="menu"] button, .popover-content button');
                items.forEach(el => results.push(el.innerText.trim()));
                return results;
            });
            console.log('Actions:', actions);
            fs.writeFileSync(path.join(artifactDir, 'veropm_actions.json'), JSON.stringify(actions, null, 2));
            await page.keyboard.press('Escape');
        }

        console.log('--- EXTRACTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
