import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
    const screenshotPath = path.join(artifactDir, 'veropm_dashboard_capture.png');
    const dataPath = path.join(artifactDir, 'veropm_data.json');

    console.log('--- VERO PM EXTRACTION START ---');
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
            console.error('ERROR: VeroPM dashboard tab not found.');
            process.exit(1);
        }

        console.log(`Found Target: ${targetPage.url()}`);
        await targetPage.bringToFront();

        // Wait for content stabilization
        await targetPage.waitForTimeout(2000);

        console.log('Capturing high-fidelity screenshot...');
        await targetPage.screenshot({ path: screenshotPath, fullPage: true });

        console.log('Extracting dashboard structure and metrics...');
        const result = await targetPage.evaluate(`(() => {
            const mapToText = (nodeList) => Array.from(nodeList).map(el => (el.innerText || '').trim()).filter(Boolean);

            const navElements = document.querySelectorAll('nav a, aside a, .sidebar a');
            const widgetElements = document.querySelectorAll('.card-title, h2, h3, [class*="widget-title"]');
            const metricElements = document.querySelectorAll('.metric-value, .stat-value, [class*="metric"], [class*="stat"]');
            const projectElements = document.querySelectorAll('.project-item, .project-row, [class*="project-name"]');

            return {
                title: document.title,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                navigation: mapToText(navElements),
                widgets: mapToText(widgetElements),
                metrics: mapToText(metricElements),
                project_list: mapToText(projectElements)
            };
        })()`);

        if (result) {
            fs.writeFileSync(dataPath, JSON.stringify(result, null, 2));
            console.log(`Data saved to: ${dataPath}`);
        } else {
            console.error('ERROR: Extraction returned empty/undefined result.');
        }
        console.log(`Data saved to: ${dataPath}`);
        console.log(`Screenshot saved to: ${screenshotPath}`);
        console.log('--- VERO PM EXTRACTION SUCCESS ---');

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR DURING EXTRACTION:', err);
        process.exit(1);
    }
}

main();
