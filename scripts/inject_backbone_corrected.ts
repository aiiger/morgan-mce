import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- VERO BACKBONE INJECTION (CORRECTED) START ---');
    const payloadPath = 'migration_payload.json';
    if (!fs.existsSync(payloadPath)) {
        console.error('ERROR: migration_payload.json not found');
        process.exit(1);
    }
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        console.log(`Using VeroPM tab: ${page.url()}`);

        // Use the domain from infra audit
        const baseUrl = 'https://app.veropm.app';
        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';

        // --- PART 1: INJECT PROJECTS ---
        console.log('Injecting Projects...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        // Check if we are still on login page
        if (page.url().includes('login')) {
            console.error('ERROR: Still on login page. Please log in manually.');
            process.exit(1);
        }

        for (const project of payload.projects.slice(0, 5)) { // First 5 for robust check
            console.log(`Processing Project: ${project['Project Name']}`);

            const exists = await page.evaluate((name) => {
                return !!Array.from(document.querySelectorAll('td, div, span')).find(el => el.textContent?.includes(name));
            }, project['Project Name']);

            if (exists) {
                console.log(`Project "${project['Project Name']}" already exists. Skipping.`);
                continue;
            }

            // Click "New Project"
            const newBtn = page.getByRole('button', { name: /new project|add project/i });
            if (await newBtn.count() > 0) {
                await newBtn.first().click();
                await page.waitForTimeout(2000);

                // Fill form
                await page.fill('input[placeholder*="Name"], label:has-text("Project Name") + input', project['Project Name']);
                await page.fill('input[placeholder*="Client"], label:has-text("Client Name") + input', project['Client Name']);

                if (project['Contract Value (AED)']) {
                    await page.fill('input[placeholder*="Value"], input[type="number"]', project['Contract Value (AED)'].toString());
                }

                // Save
                await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
                await page.waitForTimeout(3000);
                console.log(`Successfully injected project: ${project['Project Name']}`);
            } else {
                console.warn(`"New Project" button not found for ${project['Project Name']}`);
            }
        }

        console.log('--- INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL INJECTION ERROR:', err);
    }
}

main();
