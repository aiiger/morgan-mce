import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM ACCESS CHECK START ---');
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

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';

        const checkUrls = [
            { name: 'Projects', url: `https://veropm.app/workspace/${workspaceId}/projects` },
            { name: 'Proposals', url: `https://veropm.app/workspace/${workspaceId}/proposals` }
        ];

        for (const item of checkUrls) {
            console.log(`Checking ${item.name}...`);
            await page.goto(item.url);
            await page.waitForTimeout(5000); // Wait for hydration
            const screenshotPath = path.join(artifactDir, `access_check_${item.name.toLowerCase()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });

            const isRestricted = await page.evaluate(() => {
                return document.body.innerText.includes('Access Restricted') || document.body.innerText.includes('don\'t have permission');
            });

            console.log(`${item.name} Restricted: ${isRestricted}`);
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
