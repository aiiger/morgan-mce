import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM AUTOMATION DEEP DIVE (TEXT DIFF) START ---');
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

        const extractOptions = async (buttonName: string) => {
            console.log(`Extracting options for: ${buttonName}`);
            const beforeText = await page.evaluate(() => document.body.innerText);

            const btn = page.getByRole('button', { name: new RegExp(buttonName, 'i') }).first();
            if (await btn.isVisible()) {
                await btn.click();
                await page.waitForTimeout(2000);

                const afterText = await page.evaluate(() => document.body.innerText);

                // Screenshot of the open state
                await page.screenshot({ path: path.join(artifactDir, `veropm_automation_${buttonName.toLowerCase().replace(/ /g, '_')}.png`) });

                // Diff simple approach: find lines in afterText not in beforeText
                const beforeLines = new Set(beforeText.split('\n').map(l => l.trim()));
                const afterLines = afterText.split('\n').map(l => l.trim());

                const newLines = afterLines.filter(l => l.length > 2 && !beforeLines.has(l));
                console.log(`New options found for ${buttonName}:`, newLines);

                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
                return newLines;
            }
            return [];
        };

        const results = {
            triggers: [], // Already have these, but can re-verify if needed
            conditions: await extractOptions('Add Condition'),
            actions: await extractOptions('Add Action')
        };

        fs.writeFileSync(path.join(artifactDir, 'veropm_automation_text_diff.json'), JSON.stringify(results, null, 2));
        console.log('Report saved to veropm_automation_text_diff.json');

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
