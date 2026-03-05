import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM INFRA AUDIT START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let targetPage = null;
        for (const context of contexts) {
            targetPage = context.pages().find(p => p.url().includes('veropm.app'));
            if (targetPage) break;
        }

        if (!targetPage) {
            console.error('ERROR: VeroPM tab not found.');
            process.exit(1);
        }

        // Get Headers and Cookies
        const infraInfo = await targetPage.evaluate(() => {
            return {
                url: window.location.href,
                cookies: document.cookie.split('; ').map(c => c.split('=')[0]),
                localStorageKeys: Object.keys(localStorage),
                performanceEntries: performance.getEntriesByType('navigation')[0],
            };
        });

        console.log('INFRA INFO:', JSON.stringify(infraInfo, null, 2));

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_infra_audit.json'), JSON.stringify(infraInfo, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL AUDIT ERROR:', err);
    }
}

main();
