import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- REFINED MULTI-STEP INJECTION START ---');
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
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        const workspaceId = page.url().match(/workspace\/([^\/]+)/)?.[1] || 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = 'https://app.veropm.app';

        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        for (const project of payload.projects.slice(0, 5)) {
            console.log(`Injecting: ${project['Project Name']}`);

            await page.click('button:has-text("Create Project")');
            await page.waitForTimeout(3000);

            // STEP 1: Basic Info
            await page.locator('input[placeholder*="name"]').fill(project['Project Name']);
            await page.locator('input[placeholder*="PRJ"]').fill(`PRJ-${Date.now().toString().slice(-4)}`);

            // Handle Portfolio (Required Dropdown)
            const portfolioDropdown = page.locator('.ant-select-selector').first();
            if (await portfolioDropdown.isVisible()) {
                await portfolioDropdown.click();
                await page.waitForTimeout(1000);
                // Click the first option in the dropdown
                await page.locator('.ant-select-item-option-content').first().click();
                await page.waitForTimeout(500);
            }

            // Click 'Next'
            const nextBtn = page.locator('button:has-text("Next")').first();
            await nextBtn.click();
            await page.waitForTimeout(2000);

            // STEP 2: Just try to click Next if no required fields are apparent
            if (await nextBtn.isVisible()) {
                await nextBtn.click();
                await page.waitForTimeout(2000);
            }

            // STEP 3: Create
            const createBtn = page.locator('button:has-text("Create"), button:has-text("Finish")').last();
            if (await createBtn.isVisible()) {
                await createBtn.click();
                await page.waitForTimeout(5000);
                console.log(`Successfully created: ${project['Project Name']}`);
            } else {
                console.warn(`Could not finish project creation for ${project['Project Name']}. Taking screenshot.`);
                await page.screenshot({ path: `C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7/error_p1_fail_${Date.now()}.png` });
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
