import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- FINAL REFINED INJECTION START ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));
    const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7';

    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('app.veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        const workspaceId = page.url().match(/workspace\/([^\/]+)/)?.[1] || 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = 'https://app.veropm.app';

        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        for (const project of payload.projects.slice(0, 10)) {
            console.log(`Injecting: ${project['Project Name']}`);

            await page.click('button:has-text("Create Project")');
            await page.waitForTimeout(3000);

            // STEP 1
            await page.locator('input[placeholder*="name"]').fill(project['Project Name']);
            await page.locator('input[placeholder*="PRJ"]').fill(`PRJ-${Date.now().toString().slice(-4)}`);
            const pDropdown = page.locator('.ant-select-selector').first();
            if (await pDropdown.isVisible()) {
                await pDropdown.click();
                await page.waitForTimeout(1000);
                await page.locator('.ant-select-item-option-content').first().click();
            }
            await page.click('button:has-text("Next")');
            await page.waitForTimeout(2000);

            // STEP 2: Project Manager Selection (Required)
            console.log('Handling Step 2 (PM Selection)...');
            const pmDropdown = page.locator('.ant-select-selector:has-text("No user")').first();
            if (await pmDropdown.isVisible()) {
                await pmDropdown.click();
                await page.waitForTimeout(1000);
                await page.locator('.ant-select-item-option-content').first().click();
                await page.waitForTimeout(500);
            }
            await page.click('button:has-text("Next")');
            await page.waitForTimeout(2000);

            // STEP 3: Create
            const createBtn = page.locator('button:has-text("Create Project"), button:has-text("Finish")').last();
            if (await createBtn.isVisible()) {
                await createBtn.click();
                await page.waitForTimeout(5000);
                console.log(`SUCCESS: ${project['Project Name']}`);
            } else {
                console.warn(`FAIL: ${project['Project Name']}`);
                await page.screenshot({ path: `${artifactDir}/last_fail_${Date.now()}.png` });
            }

            await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
            await page.waitForTimeout(3000);
        }

        await browser.close();
    } catch (err) {
        console.error('CDP Error:', err);
    }
}

main();
