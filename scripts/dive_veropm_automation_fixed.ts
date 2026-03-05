import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (FIXED) START ---');
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

        // Navigate to Automation if not already there
        if (!page.url().includes('automation')) {
            console.log('Navigating to Automation...');
            const automationLink = page.getByRole('link', { name: 'Automation', exact: true });
            if (await automationLink.count() > 0) {
                await automationLink.click();
                await page.waitForTimeout(3000);
            }
        }

        // Ensure we are on the "Create Automation Rule" page
        // If "Back to Automation Rules" is visible, we are likely there
        const createBtn = page.getByRole('button', { name: /create rule|new rule|add rule/i });
        if (await createBtn.count() > 0) {
            console.log('Clicking Create Rule button...');
            await createBtn.first().click();
            await page.waitForTimeout(2000);
        }

        const automationLogic = await page.evaluate(`(() => {
            const results = {};
            
            // 1. Rule Metadata
            results.ruleName = document.querySelector('input[placeholder*="Assign High Priority"]') ?.value || 'Empty';
            results.description = document.querySelector('textarea[placeholder*="Describe what this rule does"]') ?.value || 'Empty';

            // 2. Trigger Extraction
            const triggerSection = Array.from(document.querySelectorAll('div')).find(div => div.innerText.includes('Trigger'));
            results.trigger = triggerSection?.querySelector('button, select')?.innerText.trim() || 'Not selected';

            // 3. Conditional Branching
            const branchingToggle = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText.includes('Enable Conditional Branching'));
            results.hasBranching = !!branchingToggle;

            // 4. Conditions and Actions
            results.hasConditions = Array.from(document.querySelectorAll('button')).some(btn => btn.innerText.includes('Add Condition'));
            results.hasActions = Array.from(document.querySelectorAll('button')).some(btn => btn.innerText.includes('Add Action'));

            // 5. Structure Snapshot
            results.structure = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
                .map(h => h.innerText.trim())
                .filter(t => t.length > 0);

            return results;
        })()`);

        console.log('AUTOMATION LOGIC:', JSON.stringify(automationLogic, null, 2));

        const screenshotPath = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6/veropm_automation_logic.png';
        await page.screenshot({ path: screenshotPath });

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_automation_logic.json'), JSON.stringify(automationLogic, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL AUTOMATION ERROR:', err);
    }
}

main();
