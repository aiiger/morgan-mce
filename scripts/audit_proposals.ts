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

        const workspaceId = page.url().match(/workspace\/([^\/]+)/)?.[1] || 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        await page.goto(`https://app.veropm.app/workspace/${workspaceId}/proposals`);
        await page.waitForTimeout(5000);

        const allText = await page.evaluate(() => document.body.innerText);
        console.log('--- PROPOSALS DOM TEXT ---');
        console.log(allText.slice(0, 5000));

        await page.screenshot({ path: 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7/proposals_audit.png' });

        await browser.close();
    } catch (err) {
        console.error('CDP Error:', err);
    }
}

main();
