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
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7';

        // Ensure we are on projects page
        const workspaceId = page.url().match(/workspace\/([^\/]+)/)?.[1] || 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        await page.goto(`https://app.veropm.app/workspace/${workspaceId}/projects`);
        await page.waitForTimeout(5000);

        const screenshotPath = path.join(artifactDir, 'post_injection_projects_list.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`Final audit screenshot saved to ${screenshotPath}`);

        await browser.close();
    } catch (err) {
        console.error('CDP Error:', err);
    }
}

main();
