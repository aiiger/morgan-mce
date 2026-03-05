import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- ANT-DESIGN OPTIMIZED VERO INJECTION START ---');
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

        for (const project of payload.projects) {
            console.log(`Checking Project: ${project['Project Name']}`);

            const exists = await page.evaluate((name) => {
                return !!Array.from(document.querySelectorAll('.project-name, td, span, div')).find(el => el.textContent?.includes(name));
            }, project['Project Name']);

            if (exists) {
                console.log(`Skipping existing project: ${project['Project Name']}`);
                continue;
            }

            // Click Create Project (Ant-Design common pattern)
            const createBtn = page.locator('button:has-text("Project")').first();
            if (await createBtn.isVisible()) {
                await createBtn.click();
                await page.waitForTimeout(3000);

                // Fill Ant-Design inputs
                const inputs = page.locator('.ant-modal-content input');
                if (await inputs.count() >= 2) {
                    await inputs.nth(0).fill(project['Project Name']);
                    await inputs.nth(1).fill(project['Client Name'] || 'Nexus Client');

                    // Value field if exists
                    const valueInput = page.locator('.ant-modal-content input[type="number"], .ant-modal-content input[placeholder*="Value"]');
                    if (await valueInput.count() > 0) {
                        await valueInput.first().fill((project['Contract Value (AED)'] || 0).toString());
                    }

                    // Click Save (usually ant-btn-primary)
                    await page.click('.ant-modal-footer button.ant-btn-primary, button:has-text("Create"), button:has-text("Save")');
                    await page.waitForTimeout(4000);
                    console.log(`Successfully Injected: ${project['Project Name']}`);
                } else {
                    console.warn('Modal inputs not found as expected.');
                    await page.screenshot({ path: path.join(artifactDir, `error_modal_${Date.now()}.png`) });
                }
            } else {
                console.warn('Create Project button not found.');
                break;
            }
        }

        // --- TENDERS ---
        console.log('Navigating to Proposals...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/proposals`);
        await page.waitForTimeout(5000);

        for (const tender of payload.tenders) {
            console.log(`Checking Tender: ${tender.title}`);
            const exists = await page.evaluate((title) => {
                return !!Array.from(document.querySelectorAll('.proposal-title, td, span, div')).find(el => el.textContent?.includes(title));
            }, tender.title);

            if (exists) {
                console.log(`Skipping existing tender: ${tender.title}`);
                continue;
            }

            const createTenderBtn = page.locator('button:has-text("Proposal"), button:has-text("Add")').first();
            if (await createTenderBtn.isVisible()) {
                await createTenderBtn.click();
                await page.waitForTimeout(2000);
                const tInputs = page.locator('.ant-modal-content input');
                await tInputs.nth(0).fill(tender.title);
                await tInputs.nth(1).fill(tender.client || 'Nexus Client');
                await page.click('.ant-modal-footer button.ant-btn-primary, button:has-text("Save")');
                await page.waitForTimeout(4000);
                console.log(`Successfully Injected: ${tender.title}`);
            }
        }

        console.log('--- ANT-DESIGN INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL SYSTEM ERROR:', err);
    }
}

main();
