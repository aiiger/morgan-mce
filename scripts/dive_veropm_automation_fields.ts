import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (FINAL FIELDS) START ---');
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

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

        // 1. Condition Fields
        console.log('Extracting Condition Fields...');
        const fieldBtn = page.getByRole('button', { name: 'Priority', exact: true }).first();
        if (await fieldBtn.isVisible()) {
            await fieldBtn.click();
            await page.waitForTimeout(1500);
            const fields = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], .select-item, .command-item'))
                    .map(el => el.innerText.trim())
                    .filter(t => t.length > 2 && !t.includes('\n'));
            });
            console.log('Condition Fields:', fields);
            fs.writeFileSync(path.join(artifactDir, 'veropm_fields.json'), JSON.stringify(fields, null, 2));
            await page.keyboard.press('Escape');
        }

        // 2. Action Types
        console.log('Extracting Action Types...');
        await page.mouse.wheel(0, 500); // Scroll to actions
        const actionTypeBtn = page.getByRole('button', { name: 'Add Comment', exact: true }).first();
        if (await actionTypeBtn.isVisible()) {
            await actionTypeBtn.click();
            await page.waitForTimeout(1500);
            const actionTypes = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], .select-item, .command-item'))
                    .map(el => el.innerText.trim())
                    .filter(t => t.length > 2 && !t.includes('\n'));
            });
            console.log('Action Types:', actionTypes);
            fs.writeFileSync(path.join(artifactDir, 'veropm_action_types.json'), JSON.stringify(actionTypes, null, 2));
            await page.keyboard.press('Escape');
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
