import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM FUNCTIONALITY EXTRACTION START ---');
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

        const features = await targetPage.evaluate(`(() => {
            const extractElements = (selector) => {
                return Array.from(document.querySelectorAll(selector)).map(el => ({
                    text: el.innerText.trim(),
                    tag: el.tagName,
                    classes: el.className,
                    id: el.id,
                    role: el.getAttribute('role'),
                    ariaLabel: el.getAttribute('aria-label')
                })).filter(el => el.text.length > 0 || el.ariaLabel);
            };

            const results = {
                buttons: extractElements('button'),
                links: extractElements('a'),
                inputs: Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
                    type: el.type,
                    placeholder: el.placeholder,
                    name: el.name,
                    value: el.value
                })),
                widgets: Array.from(document.querySelectorAll('.card, [class*="card"], .widget, [class*="widget"]')).map(el => ({
                    title: el.querySelector('h1, h2, h3, h4')?.innerText.trim(),
                    contentPreview: el.innerText.trim().substring(0, 100)
                })),
                tables: Array.from(document.querySelectorAll('table')).map(table => {
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
                    const rows = Array.from(table.querySelectorAll('tr')).slice(0, 3).map(tr => 
                        Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
                    );
                    return { headers, rows };
                })
            };
            return results;
        })()`);

        console.log('FEATURE EXTRACTION COMPLETED');

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_feature_map.json'), JSON.stringify(features, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL EXTRACTION ERROR:', err);
    }
}

main();
