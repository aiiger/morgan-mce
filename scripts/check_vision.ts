import { chromium } from 'playwright';

async function main() {
    console.log('--- NEXUS VISION DIAGNOSTIC ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();

        console.log(`Contexts found: ${contexts.length}`);
        let targetFound = false;

        for (const context of contexts) {
            const pages = context.pages();
            for (const page of pages) {
                const url = page.url();
                const title = await page.title();
                console.log(`- Tab: [${title}] URL: ${url}`);

                if (url.includes('app.veropm.app')) {
                    targetFound = true;
                    // Check if Nexus Hub exists in DOM
                    const hubExists = await page.evaluate(() => !!document.getElementById('nexus-hub-button'));
                    console.log(`  -> VeroPM Detected. Nexus Hub Active: ${hubExists}`);

                    // Force re-show dashboard for visibility check
                    if (hubExists) {
                        await page.evaluate(() => {
                            const dash = document.getElementById('nexus-dashboard');
                            if (dash) dash.style.display = 'flex';
                        });
                    }
                }
            }
        }

        if (!targetFound) {
            console.log('WARNING: No VeroPM tab detected in the browser connected to port 9222.');
        }

        await browser.close();
    } catch (err) {
        console.error('CDP Connection Failed. Is the browser open with --remote-debugging-port=9222?');
    }
}

main();
