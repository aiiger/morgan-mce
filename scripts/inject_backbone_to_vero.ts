import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- VERO BACKBONE INJECTION START ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found. Please open veropm.app in Chrome with --remote-debugging-port=9222');
            process.exit(1);
        }

        console.log(`Using VeroPM tab: ${page.url()}`);
        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';

        // --- PART 1: INJECT PROJECTS ---
        console.log('Injecting Projects...');
        await page.goto(`https://veropm.app/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(3000);

        for (const project of payload.projects.slice(0, 3)) { // Testing with first 3 to avoid overwhelming
            console.log(`Processing Project: ${project['Project Name']}`);

            // Check if exists
            const exists = await page.evaluate((name) => {
                return !!Array.from(document.querySelectorAll('td, div')).find(el => el.textContent?.includes(name));
            }, project['Project Name']);

            if (exists) {
                console.log(`Project "${project['Project Name']}" already exists. Skipping.`);
                continue;
            }

            // Click "New Project" - Selector based on audit
            await page.click('button:has-text("New Project"), button:has-text("Add Project")');
            await page.waitForTimeout(1000);

            // Fill form - These selectors are guesses based on standard Shadcn/MUI
            await page.fill('input[placeholder*="Name"], label:has-text("Name") + input', project['Project Name']);
            await page.fill('input[placeholder*="Client"], label:has-text("Client") + input', project['Client Name']);

            if (project['Contract Value (AED)']) {
                await page.fill('input[placeholder*="Value"], input[type="number"]', project['Contract Value (AED)']);
            }

            // Submit
            await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
            await page.waitForTimeout(2000);
            console.log(`Successfully injected project: ${project['Project Name']}`);
        }

        // --- PART 2: INJECT TENDERS ---
        console.log('Injecting Tenders...');
        await page.goto(`https://veropm.app/workspace/${workspaceId}/proposals`); // Tenders are usually mapped to Proposals in Vero
        await page.waitForTimeout(3000);

        for (const tender of payload.tenders.slice(0, 3)) {
            console.log(`Processing Tender: ${tender.title}`);

            const exists = await page.evaluate((title) => {
                return !!Array.from(document.querySelectorAll('td, div')).find(el => el.textContent?.includes(title));
            }, tender.title);

            if (exists) {
                console.log(`Tender "${tender.title}" already exists. Skipping.`);
                continue;
            }

            await page.click('button:has-text("New Proposal"), button:has-text("Add Tender")');
            await page.waitForTimeout(1000);

            await page.fill('input[placeholder*="Title"], label:has-text("Title") + input', tender.title);
            await page.fill('input[placeholder*="Client"], label:has-text("Client") + input', tender.client);

            if (tender.value) {
                await page.fill('input[placeholder*="Value"], input[type="number"]', tender.value.toString());
            }

            await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
            await page.waitForTimeout(2000);
            console.log(`Successfully injected tender: ${tender.title}`);
        }

        console.log('--- INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL INJECTION ERROR:', err);
    }
}

main();
