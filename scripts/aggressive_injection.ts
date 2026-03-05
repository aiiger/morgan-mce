import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- AGGRESSIVE VERO INJECTION START ---');
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

        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = 'https://app.veropm.app';

        // --- PART 1: PROJECTS ---
        console.log('Navigating to Projects...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(artifactDir, 'injection_state_projects.png') });

        for (const project of payload.projects.slice(0, 5)) {
            console.log(`Injecting Project: ${project['Project Name']}`);

            // Try to click "New Project" using multiple selector patterns
            const newBtnSelectors = [
                'button:has-text("New Project")',
                'button:has-text("Add Project")',
                '.btn-primary:has-text("Project")',
                'button >> text=/new/i',
                'svg + span:has-text("Project")'
            ];

            let clicked = false;
            for (const selector of newBtnSelectors) {
                const btn = page.locator(selector).first();
                if (await btn.isVisible()) {
                    await btn.click();
                    clicked = true;
                    break;
                }
            }

            if (!clicked) {
                console.warn(`Could not find "New Project" button for ${project['Project Name']}`);
                continue;
            }

            await page.waitForTimeout(2000);

            // Aggressive form filling
            await page.locator('input[placeholder*="Name"], input[name*="name"], label:has-text("Name") + input').first().fill(project['Project Name']);
            await page.locator('input[placeholder*="Client"], input[name*="client"], label:has-text("Client") + input').first().fill(project['Client Name']);

            if (project['Contract Value (AED)']) {
                await page.locator('input[placeholder*="Value"], input[name*="value"], input[type="number"]').first().fill(project['Contract Value (AED)'].toString());
            }

            // Aggressive Save
            const saveBtnSelectors = ['button[type="submit"]', 'button:has-text("Save")', 'button:has-text("Create")', 'button:has-text("Accept")'];
            for (const selector of saveBtnSelectors) {
                const btn = page.locator(selector).first();
                if (await btn.isVisible()) {
                    await btn.click();
                    break;
                }
            }

            await page.waitForTimeout(3000);
            console.log(`Injection call completed for: ${project['Project Name']}`);
        }

        // --- PART 2: TENDERS (into Proposals) ---
        console.log('Navigating to Proposals (Tenders)...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/proposals`);
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(artifactDir, 'injection_state_proposals.png') });

        for (const tender of payload.tenders.slice(0, 5)) {
            console.log(`Injecting Tender: ${tender.title}`);

            await page.click('button:has-text("New Proposal"), button:has-text("Add Proposal"), button >> text=/new/i');
            await page.waitForTimeout(2000);

            await page.locator('input[placeholder*="Title"], input[name*="title"]').first().fill(tender.title);
            await page.locator('input[placeholder*="Client"], input[name*="client"]').first().fill(tender.client);

            if (tender.value) {
                await page.locator('input[placeholder*="Value"], input[type="number"]').first().fill(tender.value.toString());
            }

            await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
            await page.waitForTimeout(3000);
            console.log(`Injection call completed for: ${tender.title}`);
        }

        console.log('--- AGGRESSIVE INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
