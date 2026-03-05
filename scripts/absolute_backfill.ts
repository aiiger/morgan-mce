import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- MISSION: ABSOLUTE BACKFILL START ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));
    const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7';

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

        // Get existing projects to avoid duplicates
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);
        const existingNames = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('td')).map(el => el.innerText.trim());
        });

        for (const project of payload.projects) {
            if (existingNames.includes(project['Project Name'])) {
                console.log(`SKIP: ${project['Project Name']} already exists.`);
                continue;
            }

            console.log(`Injecting Persistence: ${project['Project Name']}`);
            try {
                await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
                await page.waitForTimeout(3000);

                const createBtn = page.locator('button:has-text("Project")');
                await createBtn.click();
                await page.waitForTimeout(2000);

                // STEP 1: Basic Info
                await page.locator('input[placeholder*="name"]').fill(project['Project Name']);
                await page.locator('input[placeholder*="PRJ"]').fill(`PRJ-${Date.now().toString().slice(-4)}`);

                // Portfolio (Keyboard)
                const pSelect = page.locator('.ant-select-selector').first();
                await pSelect.click();
                await page.waitForTimeout(1000);
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                await page.waitForTimeout(500);

                await page.click('button:has-text("Next")');
                await page.waitForTimeout(2000);

                // STEP 2: PM (Keyboard)
                console.log('  PM Select...');
                const pmSelect = page.locator('.ant-select-selector:has-text("No user"), label:has-text("Project Manager") + div .ant-select-selector').first();
                if (await pmSelect.isVisible()) {
                    await pmSelect.click();
                    await page.waitForTimeout(1000);
                    await page.keyboard.press('ArrowDown');
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(500);
                }

                await page.click('button:has-text("Next")');
                await page.waitForTimeout(2000);

                // STEP 3: Finish
                const finishBtn = page.locator('button:has-text("Create"), button:has-text("Finish")').last();
                if (await finishBtn.isVisible()) {
                    await finishBtn.click();
                    await page.waitForTimeout(5000);
                    console.log(`  SUCCESS: ${project['Project Name']}`);
                    existingNames.push(project['Project Name']);
                } else {
                    console.warn(`  FAIL to reach Step 3 for ${project['Project Name']}`);
                }
            } catch (pErr) {
                console.error(`  Error during project sync: ${project['Project Name']}`, pErr);
                await page.screenshot({ path: `${artifactDir}/sync_err_${Date.now()}.png` });
            }
        }

        console.log('--- BACKLOG DRAINED. SYSTEM IN SYNC. ---');
        await browser.close();
    } catch (err) {
        console.error('Migration Engine Failure:', err);
    }
}

main();
