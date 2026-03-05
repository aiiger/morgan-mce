import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

    console.log('--- VERO PM DEEP EXPLORATION START ---');
    try {
        console.log('Connecting to CDP on http://localhost:9222...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();

        let targetPage = null;
        for (const context of contexts) {
            const pages = context.pages();
            targetPage = pages.find(p => p.url().includes('veropm.app'));
            if (targetPage) break;
        }

        if (!targetPage) {
            console.error('ERROR: VeroPM tab not found.');
            process.exit(1);
        }

        console.log(`Found Target: ${targetPage.url()}`);
        await targetPage.bringToFront();

        const sectionsToExplore = [
            { name: 'Projects', selector: 'text="Projects"' },
            { name: 'RiskRegister', selector: 'text="Risk Register"' },
            { name: 'Financials', selector: 'text="Budgets"' },
            { name: 'Capacity', selector: 'text="Capacity Planning"' }
        ];

        const explorationResults = [];

        for (const section of sectionsToExplore) {
            console.log(`\nNavigating to: ${section.name}...`);
            try {
                // Click the navigation item
                await targetPage.click(section.selector, { timeout: 5000 });
                await targetPage.waitForTimeout(3000); // Wait for render

                const screenshotPath = path.join(artifactDir, `veropm_${section.name.toLowerCase()}.png`);
                await targetPage.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`Screenshot saved: ${screenshotPath}`);

                const data = await targetPage.evaluate(`(() => {
                    const mapToText = (nodeList) => Array.from(nodeList).map(el => (el.innerText || '').trim()).filter(Boolean);
                    
                    return {
                        section: "${section.name}",
                        url: window.location.href,
                        headers: mapToText(document.querySelectorAll('h1, h2, h3')),
                        buttons: mapToText(document.querySelectorAll('button, .btn')),
                        list_items: mapToText(document.querySelectorAll('.list-item, tr, .card-title')).slice(0, 10)
                    };
                })()`);

                explorationResults.push(data);

                // Navigate back to dashboard if needed, or just stay sequential
                // targetPage.goBack() might be risky, let's just click "Dashboard"
                await targetPage.click('text="Dashboard"', { timeout: 5000 }).catch(() => { });
                await targetPage.waitForTimeout(2000);
            } catch (sectionErr) {
                console.warn(`Failed to explore ${section.name}:`, sectionErr.message);
            }
        }

        const reportPath = path.join(artifactDir, 'veropm_deep_exploration.json');
        fs.writeFileSync(reportPath, JSON.stringify(explorationResults, null, 2));
        console.log(`\nDeep exploration completed. Data saved to: ${reportPath}`);

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR DURING EXPLORATION:', err);
        process.exit(1);
    }
}

main();
