import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- VERO BACKBONE LOGIN & INJECTION START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('app.veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No app.veropm.app tab found.');
            process.exit(1);
        }

        console.log(`Current URL: ${page.url()}`);

        if (page.url().includes('login')) {
            console.log('Attempting to click "Sign In" button...');
            await page.click('button:has-text("Sign In")');
            await page.waitForTimeout(5000);
            console.log(`URL after login click: ${page.url()}`);
        }

        if (page.url().includes('login')) {
            console.error('ERROR: Still on login page after attempt.');
            process.exit(1);
        }

        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = 'https://app.veropm.app';

        // --- INJECT PROJECTS ---
        console.log('Navigating to Projects...');
        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

        for (const project of payload.projects.slice(0, 5)) {
            console.log(`Processing Project: ${project['Project Name']}`);

            const exists = await page.evaluate((name) => {
                return !!Array.from(document.querySelectorAll('td, div, span')).find(el => el.textContent?.includes(name));
            }, project['Project Name']);

            if (exists) {
                console.log(`Project "${project['Project Name']}" already exists. Skipping.`);
                continue;
            }

            const newBtn = page.getByRole('button', { name: /new project|add project/i });
            if (await newBtn.count() > 0) {
                await newBtn.first().click();
                await page.waitForTimeout(2000);
                await page.fill('input[placeholder*="Name"], label:has-text("Project Name") + input', project['Project Name']);
                await page.fill('input[placeholder*="Client"], label:has-text("Client Name") + input', project['Client Name']);
                if (project['Contract Value (AED)']) {
                    await page.fill('input[placeholder*="Value"], input[type="number"]', project['Contract Value (AED)'].toString());
                }
                await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
                await page.waitForTimeout(3000);
                console.log(`Successfully injected project: ${project['Project Name']}`);
            }
        }

        console.log('--- INJECTION COMPLETE ---');
        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
