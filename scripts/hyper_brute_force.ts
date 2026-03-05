import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- SYSTEM: HYPER-ROBUST PERSISTENCE TRIGGERED ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

    let browser;
    try {
        browser = await chromium.connectOverCDP('http://localhost:9222');
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

        // 1. Signal Signal to USER in the Tab
        await page.evaluate(() => {
            const syncBar = document.createElement('div');
            syncBar.id = 'nexus-sync-bar';
            syncBar.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:4px; background:linear-gradient(90deg, #00f2ff, #000); z-index:9999999; animation: nexusPulse 2s infinite;';
            document.body.appendChild(syncBar);
            const style = document.createElement('style');
            style.innerHTML = '@keyframes nexusPulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }';
            document.head.appendChild(style);
        });

        // Get Existing
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);
        const existingNames = await page.evaluate(() =>
            Array.from(document.querySelectorAll('td, .ant-list-item-meta-title')).map(el => el.textContent?.trim())
        );

        for (const project of payload.projects) {
            if (existingNames.includes(project['Project Name'])) {
                console.log(`SKIPPING: ${project['Project Name']}`);
                continue;
            }

            console.log(`Diving into: ${project['Project Name']}`);
            let attempt = 0;
            let success = false;

            while (attempt < 2 && !success) {
                try {
                    await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
                    await page.waitForTimeout(3000);

                    // Click Create - Using stronger selector
                    const addBtn = page.locator('button:has-text("Project"), button .anticon-plus').first();
                    await addBtn.click();
                    await page.waitForTimeout(3000);

                    // Step 1: Basic Info
                    await page.waitForSelector('input', { timeout: 10000 });
                    await page.keyboard.type(project['Project Name']);
                    await page.keyboard.press('Tab');
                    await page.keyboard.type(`PRJ-${Date.now().toString().slice(-4)}`);
                    await page.keyboard.press('Tab');

                    // Portfolio - Keyboard Brute Force (Space + Down + Enter)
                    await page.keyboard.press('Space');
                    await page.waitForTimeout(1000);
                    await page.keyboard.press('ArrowDown');
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(500);

                    // Navigate to Next
                    await page.click('button:has-text("Next")');
                    await page.waitForTimeout(2000);

                    // Step 2: PM Selection
                    await page.keyboard.press('Tab'); // Jump to PM select
                    await page.keyboard.press('Space');
                    await page.waitForTimeout(1000);
                    await page.keyboard.press('ArrowDown');
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(500);

                    await page.click('button:has-text("Next")');
                    await page.waitForTimeout(2000);

                    // Step 3: Finish
                    const finish = page.locator('button:has-text("Create"), button:has-text("Finish")').last();
                    await finish.click();
                    await page.waitForTimeout(5000);

                    console.log(`  DONE: ${project['Project Name']}`);
                    success = true;
                } catch (e) {
                    console.warn(`  Attempt ${attempt + 1} failed for ${project['Project Name']}. Retrying...`);
                    attempt++;
                }
            }
        }

        await page.evaluate(() => document.getElementById('nexus-sync-bar')?.remove());
        await browser.close();
    } catch (err) {
        console.error('SYSTEM FAIL:', err);
    }
}

main();
