import { chromium } from 'playwright';

async function main() {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        console.log(`Found ${contexts.length} contexts`);
        for (const context of contexts) {
            const pages = context.pages();
            console.log(`Context has ${pages.length} pages`);
            for (const page of pages) {
                console.log(`Page URL: ${page.url()}`);
                console.log(`Page Title: ${await page.title()}`);
            }
        }
        await browser.close();
    } catch (err) {
        console.error('CDP Connection Error:', err);
    }
}

main();
