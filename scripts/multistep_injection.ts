import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- MULTI-STEP VERO INJECTION START ---');
    const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7';
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

        const currentUrl = page.url();
        const workspaceId = currentUrl.match(/workspace\/([^\/]+)/)?.[1] || 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = 'https://app.veropm.app';

        // --- PROJECTS ---
        console.log('Navigating to Projects...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        for (const project of payload.projects.slice(0, 10)) {
            console.log(`Checking Project: ${project['Project Name']}`);

            const exists = await page.evaluate((name) => {
                return !!Array.from(document.querySelectorAll('td, span, div')).find(el => el.textContent?.includes(name));
            }, project['Project Name']);

            if (exists) {
                console.log(`Skipping: ${project['Project Name']}`);
                continue;
            }

            const createBtn = page.locator('button:has-text("Project")').first();
            if (await createBtn.isVisible()) {
                await createBtn.click();
                await page.waitForTimeout(3000);

                // STEP 1: Basic Information
                console.log('Filling Step 1...');
                await page.locator('input[placeholder*="name"], input[name*="name"]').first().fill(project['Project Name']);

                // Project Code (Auto-generate if missing)
                const code = project['Project Code'] || `PRJ-${Date.now().toString().slice(-4)}`;
                await page.locator('input[placeholder*="PRJ"], input[name*="code"]').first().fill(code);

                // Click 'Next' or 'Create' at bottom
                const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button.ant-btn-primary').last();
                if (await nextBtn.isVisible()) {
                    await nextBtn.click();
                    await page.waitForTimeout(2000);

                    // Simple skip for Step 2/3 for now to just get the entity created if possible
                    // Or keep clicking 'Next' until 'Finish/Create'
                    for (let step = 2; step <= 3; step++) {
                        const finishBtn = page.locator('button:has-text("Finish"), button:has-text("Create"), button:has-text("Save")').first();
                        if (await finishBtn.isVisible()) {
                            await finishBtn.click();
                            break;
                        }
                        const stNext = page.locator('button:has-text("Next")').first();
                        if (await stNext.isVisible()) {
                            await stNext.click();
                            await page.waitForTimeout(2000);
                        }
                    }
                }

                await page.waitForTimeout(4000);
                console.log(`Injected: ${project['Project Name']}`);

                // Go back to projects list for next item
                await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
                await page.waitForTimeout(3000);
            }
        }

        console.log('--- MULTI-STEP INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL SYSTEM ERROR:', err);
    }
}

main();
