import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
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

        await page.goto(`${baseUrl}/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        const projects = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('td, .project-name, [data-cell="true"]'))
                .map(el => el.textContent?.trim())
                .filter(txt => txt && txt.length > 5);
        });

        console.log('--- EXISTING PROJECTS ---');
        console.log(JSON.stringify([...new Set(projects)], null, 2));

        await browser.close();
    } catch (err) {
        console.error('CDP Error:', err);
    }
}

main();
