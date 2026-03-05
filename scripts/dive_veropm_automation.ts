import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE START ---');
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

        // Navigate to Automation
        console.log('Navigating to Automation...');
        const automationLink = page.getByRole('link', { name: 'Automation', exact: true });
        if (await automationLink.count() > 0) {
            await automationLink.click();
            await page.waitForTimeout(3000);
        }

        // Click "New Rule" or similar if possible to reach the "Create Automation Rule" page
        // Based on common patterns in Shadcn/MUI apps
        const createBtn = page.getByRole('button', { name: /create|new|add/i });
        if (await createBtn.count() > 0) {
            await createBtn.first().click();
            await page.waitForTimeout(2000);
        }

        const automationLogic = await page.evaluate(`(() => {
            const results = {};
            
            // Extract Triggers
            const triggerSelect = document.querySelector('button[id*="radix-"], select, [role="combobox"]');
            results.triggers = triggerSelect ? triggerSelect.innerText.trim() : 'Not found';

            // Extract Rule Fields
            results.fields = Array.from(document.querySelectorAll('label')).map(label => ({
                label: label.innerText.trim(),
                inputPlaceholder: label.nextElementSibling?.placeholder || 'No placeholder'
            }));

            // Extract Condition Logic
            results.conditions = !!document.querySelector('button:has-text("Condition")') || !!document.querySelector('.border-dashed');

            // Capture Page Text Groups
            results.textGroups = Array.from(document.querySelectorAll('h1, h2, h3, span'))
                .map(el => el.innerText.trim())
                .filter(t => t.length > 5 && t.length < 100);

            return results;
        })()`);

        console.log('AUTOMATION LOGIC:', JSON.stringify(automationLogic, null, 2));

        const screenshotPath = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6/veropm_automation_create.png';
        await page.screenshot({ path: screenshotPath });

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_automation_map.json'), JSON.stringify(automationLogic, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL AUTOMATION ERROR:', err);
    }
}

main();
