import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (RESILIENT) START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: VeroPM tab not found.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

        // Navigate to Automation
        if (!page.url().includes('automation')) {
            console.log('Navigating to Automation...');
            await page.goto('https://veropm.app/automation', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
        }

        // Check if we need to click "Create Rule"
        const createBtn = page.getByRole('button', { name: /create rule|new rule|add rule/i });
        const onCreationPage = page.url().includes('/new') || await page.getByText('Create Automation Rule').isVisible();

        if (!onCreationPage && await createBtn.count() > 0) {
            console.log('Clicking Create Rule button...');
            await createBtn.first().click();
            await page.waitForTimeout(2000);
        }

        const report = { triggers: [], conditions: [], actions: [] };

        // 1. Capture Triggers
        console.log('Detecting Triggers...');
        // Look for the trigger selector. Usually it's the first button in the "Trigger" block
        const triggerArea = page.locator('div:has-text("Trigger")').first();
        const triggerBtn = triggerArea.locator('button').first();

        if (await triggerBtn.isVisible()) {
            console.log('Opening Trigger dropdown...');
            await triggerBtn.click();
            await page.waitForTimeout(1500);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_automation_triggers.png') });

            report.triggers = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], .select-item, button'));
                return items.map(el => el.innerText.trim()).filter(t => t.length > 2 && !t.includes('\n'));
            });
            console.log('Found Triggers:', report.triggers);
            await page.mouse.click(10, 10); // Close
            await page.waitForTimeout(500);
        }

        // 2. Capture Conditions
        console.log('Detecting Conditions...');
        const addConditionBtn = page.getByRole('button', { name: /add condition/i }).first();
        if (await addConditionBtn.isVisible()) {
            await addConditionBtn.click();
            await page.waitForTimeout(1500);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_automation_conditions.png') });

            report.conditions = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.popover-content button, [role="menuitem"]'));
                return items.map(el => el.innerText.trim()).filter(t => t.length > 2);
            });
            console.log('Found Conditions:', report.conditions);
            await page.mouse.click(10, 10); // Close
            await page.waitForTimeout(500);
        }

        // 3. Capture Actions
        console.log('Detecting Actions...');
        const addActionBtn = page.getByRole('button', { name: /add action/i }).first();
        if (await addActionBtn.isVisible()) {
            await addActionBtn.click();
            await page.waitForTimeout(1500);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_automation_actions.png') });

            report.actions = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.popover-content button, [role="menuitem"]'));
                return items.map(el => el.innerText.trim()).filter(t => t.length > 2);
            });
            console.log('Found Actions:', report.actions);
        }

        fs.writeFileSync(path.join(artifactDir, 'veropm_automation_full_report.json'), JSON.stringify(report, null, 2));
        console.log('Extraction complete. Saved to veropm_automation_full_report.json');

        await browser.close();
    } catch (err) {
        console.error('FATAL AUTOMATION ERROR:', err);
    }
}

main();
