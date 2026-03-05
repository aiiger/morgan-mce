import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
    console.log('--- RECONNAISSANCE: CAPTURING VERO DNA ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('app.veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: Open app.veropm.app in your debugging browser (port 9222).');
            process.exit(1);
        }

        const dna = await page.evaluate(() => {
            const labels = Array.from(document.querySelectorAll('label')).map(l => l.innerText.trim());
            const sections = Array.from(document.querySelectorAll('.ant-card-head-title, h1, h2, h3')).map(h => h.innerText.trim());
            const fields = Array.from(document.querySelectorAll('.ant-form-item')).map(el => {
                const label = el.querySelector('label')?.innerText.trim() || 'unlabeled';
                const input = el.querySelector('input, select, textarea');
                return { label, type: input ? input.tagName : 'unknown' };
            });

            return { labels, sections, fields };
        });

        const outputDir = 'C:/Users/t1glish/.gemini/antigravity/brain/61544510-cff3-44bb-aa3d-ba480fb9dee7';
        fs.writeFileSync(`${outputDir}/veropm_logic_dna.json`, JSON.stringify(dna, null, 2));
        console.log('DNA Captured successfullly.');

        await browser.close();
    } catch (err) {
        console.error('Extraction Failed:', err);
    }
}

main();
