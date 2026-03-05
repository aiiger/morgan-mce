import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (FINAL LOGIC) START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        if (!page.url().includes('automation')) {
            await page.goto('https://veropm.app/automation', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

        // 1. Ensure Trigger is Selected
        console.log('Ensuring Trigger is selected...');
        const triggerDisplay = await page.getByText('Task Status Changed', { exact: false }).first();
        if (!await triggerDisplay.isVisible()) {
            console.log('Trigger not visible, trying to open dropdown...');
            // ... already have triggers, assume "Task Status Changed" is default in UI
        }

        // 2. Conditions Deep Dive
        console.log('Clicking Add Condition...');
        const addConditionBtn = page.getByRole('button', { name: /add condition|add first condition/i }).first();
        if (await addConditionBtn.isVisible()) {
            await addConditionBtn.click();
            await page.waitForTimeout(2000); // Allow Radix popover to animate

            const conditionData = await page.evaluate(() => {
                // Radix-UI usually puts popovers in a portal at the end of body
                const popovers = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper]'));
                const latestPopover = popovers[popovers.length - 1];
                if (!latestPopover) return { error: 'No popover found', html: document.body.innerHTML.slice(0, 500) };

                return {
                    options: Array.from(latestPopover.querySelectorAll('button, [role="menuitem"], div'))
                        .map(el => el.innerText.trim())
                        .filter(t => t.length > 2 && !t.includes('\n')),
                    classes: latestPopover.className
                };
            });
            console.log('Conditions:', conditionData);
            fs.writeFileSync(path.join(artifactDir, 'veropm_conditions_raw.json'), JSON.stringify(conditionData, null, 2));
            await page.keyboard.press('Escape');
        }

        // 3. Actions Deep Dive
        console.log('Scrolling to Actions...');
        await page.mouse.wheel(0, 2000);
        await page.waitForTimeout(1000);

        const addActionBtn = page.getByRole('button', { name: /add action/i }).first();
        if (await addActionBtn.isVisible()) {
            await addActionBtn.click();
            await page.waitForTimeout(2000);

            const actionData = await page.evaluate(() => {
                const popovers = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper]'));
                const latestPopover = popovers[popovers.length - 1];
                if (!latestPopover) return { error: 'No popover found' };

                return {
                    options: Array.from(latestPopover.querySelectorAll('button, [role="menuitem"], div'))
                        .map(el => el.innerText.trim())
                        .filter(t => t.length > 2 && !t.includes('\n'))
                };
            });
            console.log('Actions:', actionData);
            fs.writeFileSync(path.join(artifactDir, 'veropm_actions_raw.json'), JSON.stringify(actionData, null, 2));
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
