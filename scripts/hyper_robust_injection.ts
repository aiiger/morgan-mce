import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- HYPER-ROBUST INJECTION START ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('app.veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroTab.');
            process.exit(1);
        }

        const workspaceId = page.url().match(/workspace\/([^\/]+)/)?.[1] || 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = 'https://app.veropm.app';

        for (const project of payload.projects.slice(0, 5)) {
            console.log(`Injecting: ${project['Project Name']}`);
            await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
            await page.waitForTimeout(4000);

            // Click Create
            await page.waitForSelector('button:has-text("Project")', { timeout: 10000 });
            await page.click('button:has-text("Project")');

            // Wait for Form
            await page.waitForSelector('input[placeholder*="name"]', { timeout: 10000 });
            await page.locator('input[placeholder*="name"]').fill(project['Project Name']);
            await page.locator('input[placeholder*="PRJ"]').fill(`PRJ-${Date.now().toString().slice(-4)}`);

            // Select Portfolio
            await page.waitForSelector('.ant-select-selector');
            await page.locator('.ant-select-selector').first().click();
            await page.waitForTimeout(1000);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            await page.click('button:has-text("Next")');
            await page.waitForTimeout(2000);

            // Step 2: PM
            console.log('PM Select...');
            await page.waitForSelector('.ant-select-selector');
            // PM is usually the second select if Step 2 has Client first, or first if PM is top
            const pmSelect = page.locator('.ant-select-selector').first();
            await pmSelect.click();
            await page.waitForTimeout(1000);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            await page.click('button:has-text("Next")');
            await page.waitForTimeout(2000);

            // Step 3: Finish
            const finish = page.locator('button:has-text("Create"), button:has-text("Finish")').last();
            await finish.click();
            await page.waitForTimeout(4000);
            console.log(`DONE: ${project['Project Name']}`);
        }

        await browser.close();
    } catch (err) {
        console.error('BOOM:', err);
    }
}

main();
