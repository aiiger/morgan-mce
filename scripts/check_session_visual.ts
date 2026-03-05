import { chromium } from 'playwright';
import path from 'path';

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
            console.log('No app.veropm.app tab found. Checking all veropm.app tabs...');
            for (const context of contexts) {
                page = context.pages().find(p => p.url().includes('veropm.app'));
                if (page) break;
            }
        }

        if (page) {
            console.log(`Found page: ${page.url()}`);
            const screenshotPath = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7/veropm_session_check.png';
            await page.screenshot({ path: screenshotPath });
            console.log(`Screenshot saved to ${screenshotPath}`);
        } else {
            console.error('No VeroPM related tabs found.');
        }
        await browser.close();
    } catch (err) {
        console.error('CDP Error:', err);
    }
}

main();
