import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM SCHEMA EXTRACTION START ---');
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

        const schemaData = await targetPage.evaluate(`(() => {
            const results = {};
            
            // 1. Capture All Text Groupings (Cards/Panels)
            results.cards = Array.from(document.querySelectorAll('div'))
                .filter(div => {
                    const style = window.getComputedStyle(div);
                    return (style.borderWidth !== '0px' || style.boxShadow !== 'none' || style.backgroundColor !== 'rgba(0, 0, 0, 0)') 
                           && div.innerText.trim().length > 10 
                           && div.innerText.trim().length < 500
                           && div.children.length > 0;
                })
                .map(div => ({
                    header: div.querySelector('h1, h2, h3, h4, span')?.innerText.trim(),
                    content: div.innerText.trim().split('\\n').filter(t => t.trim().length > 0).slice(0, 5)
                })).slice(0, 20);

            // 2. Capture Data Grids (looking for ARIA grids or roles)
            results.grids = Array.from(document.querySelectorAll('[role="grid"], [role="table"], table'))
                .map(grid => {
                    const headers = Array.from(grid.querySelectorAll('[role="columnheader"], th')).map(h => h.innerText.trim());
                    const cells = Array.from(grid.querySelectorAll('[role="cell"], td')).map(c => c.innerText.trim()).slice(0, 10);
                    return { headers, cells };
                });

            // 3. Capture Metric Groups
            results.metrics = Array.from(document.querySelectorAll('div'))
                .filter(div => /\\d+(\\.\\d+)?%?/.test(div.innerText) && div.innerText.length < 50)
                .map(div => div.innerText.trim())
                .filter((v, i, a) => a.indexOf(v) === i)
                .slice(0, 10);

            return results;
        })()`);

        console.log('SCHEMA EXTRACTION COMPLETED');

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_schema_data.json'), JSON.stringify(schemaData, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL EXTRACTION ERROR:', err);
    }
}

main();
