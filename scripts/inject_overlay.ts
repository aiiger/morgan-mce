import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- NEXUS OVERLAY INJECTION INITIATED ---');
    const css = fs.readFileSync('scripts/nexus_overlay.css', 'utf8');
    const js = fs.readFileSync('scripts/nexus_overlay.js', 'utf8');
    const data = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('app.veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroTab.');
            process.exit(1);
        }

        // 1. Inject CSS
        await page.addStyleTag({ content: css });
        console.log('CSS Injected.');

        // 2. Prepare Data and Inject JS
        const dataInjectedJs = js.replace('[/* INJECTED_VIA_SCRIPT */]', JSON.stringify(data.projects.slice(0, 10)));
        await page.addScriptTag({ content: dataInjectedJs });
        console.log('JS Injected with Project Data.');

        // 3. Trigger Click to show dashboard for screenshot
        await page.click('#nexus-hub-button');
        await page.waitForTimeout(1000);

        const screenshotPath = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7/nexus_hub_injected.png';
        await page.screenshot({ path: screenshotPath });
        console.log(`Success! Visual verified at ${screenshotPath}`);

        await browser.close();
    } catch (err) {
        console.error('Injection Failed:', err);
    }
}

main();
