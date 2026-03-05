import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- NEXUS IMPERIAL MODE: SYSTEM ACTIVATION ---');
    const css = fs.readFileSync('scripts/imperial_hardening.css', 'utf8');
    const hubCss = fs.readFileSync('scripts/nexus_overlay.css', 'utf8');
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

        // 1. Inject Imperial Surface CSS
        await page.addStyleTag({ content: css });
        await page.addStyleTag({ content: hubCss }); // Extra Hub styles
        console.log('Imperial Design System Deployed.');

        // 2. Prepare Data and Inject Hub JS
        const dataInjectedJs = js.replace('[/* INJECTED_VIA_SCRIPT */]', JSON.stringify(data.projects));
        await page.addScriptTag({ content: dataInjectedJs });
        console.log('Neural Link Operational.');

        // 3. Take Final Verification Screenshot
        const screenshotPath = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7/imperial_mode_activated.png';
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`Mission Complete. Visual verified at ${screenshotPath}`);

        await browser.close();
    } catch (err) {
        console.error('Activation Failed:', err);
    }
}

main();
