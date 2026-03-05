import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- MASTER VERO BACKBONE INJECTION START ---');
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

        // --- PART 1: PROJECTS (44 Items) ---
        console.log('Navigating to Projects...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        for (const project of payload.projects) {
            console.log(`Checking Project: ${project['Project Name']}`);

            // Check if exists
            const exists = await page.evaluate((name) => {
                return !!Array.from(document.querySelectorAll('td, .project-name, span, div')).find(el => el.textContent?.includes(name));
            }, project['Project Name']);

            if (exists) {
                console.log(`Project "${project['Project Name']}" already exists. Skipping.`);
                continue;
            }

            // Click "Create Project" - Fixed Selector
            const createBtn = page.locator('button:has-text("Create Project"), button:has-text("Add Project")').first();
            if (await createBtn.isVisible()) {
                await createBtn.click();
                await page.waitForTimeout(2000);

                // Fill Form
                await page.locator('input[placeholder*="Name"], label:has-text("Project Name") + input').first().fill(project['Project Name']);
                await page.locator('input[placeholder*="Client"], label:has-text("Client Name") + input').first().fill(project['Client Name'] || 'Internal');

                if (project['Contract Value (AED)']) {
                    await page.locator('input[placeholder*="Value"], input[type="number"]').first().fill(project['Contract Value (AED)'].toString());
                }

                await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
                await page.waitForTimeout(4000); // Wait for modal to close and list to refresh
                console.log(`Project Injected: ${project['Project Name']}`);
            } else {
                console.warn('Create Project button not found.');
                break;
            }
        }

        // --- PART 2: TENDERS (13 Items) ---
        console.log('Navigating to Proposals (Tenders)...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/proposals`);
        await page.waitForTimeout(5000);

        for (const tender of payload.tenders) {
            console.log(`Checking Tender: ${tender.title}`);

            const exists = await page.evaluate((title) => {
                return !!Array.from(document.querySelectorAll('td, .proposal-name, span, div')).find(el => el.textContent?.includes(title));
            }, tender.title);

            if (exists) {
                console.log(`Tender "${tender.title}" already exists. Skipping.`);
                continue;
            }

            const createTenderBtn = page.locator('button:has-text("New Proposal"), button:has-text("Add Proposal")').first();
            if (await createTenderBtn.isVisible()) {
                await createTenderBtn.click();
                await page.waitForTimeout(2000);

                await page.locator('input[placeholder*="Title"]').first().fill(tender.title);
                await page.locator('input[placeholder*="Client"]').first().fill(tender.client || 'Internal');
                if (tender.value) {
                    await page.locator('input[placeholder*="Value"], input[type="number"]').first().fill(tender.value.toString());
                }

                await page.click('button[type="submit"], button:has-text("Save")');
                await page.waitForTimeout(4000);
                console.log(`Tender Injected: ${tender.title}`);
            }
        }

        console.log('--- MASTER INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL SYSTEM ERROR:', err);
    }
}

main();
