import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- FINAL VERO INJECTION START ---');
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

        // --- STEP 1: WORKSPACE SELECTION ---
        console.log('Checking for workspace selection...');
        if (page.url().endsWith('/workspace') || page.url().includes('login')) {
            const workspaceCard = page.locator('div:has-text("Fpsos"), .workspace-card').first();
            if (await workspaceCard.isVisible()) {
                console.log('Clicking "Fpsos" workspace...');
                await workspaceCard.click();
                await page.waitForTimeout(5000);
            }
        }

        // --- STEP 2: PROJECT INJECTION ---
        console.log('Navigating to Projects...');
        const currentUrl = page.url();
        const workspaceId = currentUrl.match(/workspace\/([^\/]+)/)?.[1];
        if (!workspaceId) {
            console.error('ERROR: Could not determine Workspace ID from URL:', currentUrl);
            process.exit(1);
        }

        console.log(`Verified Workspace ID: ${workspaceId}`);
        await page.goto(`https://app.veropm.app/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(artifactDir, 'final_projects_view.png') });

        for (const project of payload.projects.slice(0, 10)) { // Inject 10 projects
            console.log(`Injecting Project: ${project['Project Name']}`);

            const newBtn = page.getByRole('button', { name: /new project|add project/i }).first();
            if (await newBtn.isVisible()) {
                await newBtn.click();
                await page.waitForTimeout(2000);

                await page.locator('input[placeholder*="Name"], input[name*="name"], .modal input').first().fill(project['Project Name']);
                await page.locator('input[placeholder*="Client"], input[name*="client"], .modal input').nth(1).fill(project['Client Name']);

                if (project['Contract Value (AED)']) {
                    await page.locator('input[placeholder*="Value"], input[type="number"]').first().fill(project['Contract Value (AED)'].toString());
                }

                await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
                await page.waitForTimeout(3000);
                console.log(`Successfully injected: ${project['Project Name']}`);
            } else {
                console.warn('Could not find "New Project" button.');
                await page.screenshot({ path: path.join(artifactDir, 'error_no_new_btn.png') });
                break;
            }
        }

        // --- STEP 3: TENDER INJECTION ---
        console.log('Navigating to Proposals (Tenders)...');
        await page.goto(`https://app.veropm.app/workspace/${workspaceId}/proposals`);
        await page.waitForTimeout(5000);

        for (const tender of payload.tenders.slice(0, 10)) {
            console.log(`Injecting Tender: ${tender.title}`);
            const newTenderBtn = page.getByRole('button', { name: /new proposal|add proposal/i }).first();
            if (await newTenderBtn.isVisible()) {
                await newTenderBtn.click();
                await page.waitForTimeout(2000);
                await page.locator('input[placeholder*="Title"]').first().fill(tender.title);
                await page.locator('input[placeholder*="Client"]').first().fill(tender.client);
                if (tender.value) {
                    await page.locator('input[placeholder*="Value"], input[type="number"]').first().fill(tender.value.toString());
                }
                await page.click('button[type="submit"], button:has-text("Save")');
                await page.waitForTimeout(3000);
                console.log(`Successfully injected: ${tender.title}`);
            }
        }

        console.log('--- FINAL INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
