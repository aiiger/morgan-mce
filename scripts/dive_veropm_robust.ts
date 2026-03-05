import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM ROBUST DISCOVERY START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';

        // 1. Map Sidebar
        console.log('Mapping Sidebar Links...');
        const sidebarLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            return links.map(a => ({
                text: a.innerText.trim(),
                href: a.getAttribute('href'),
                aria: a.getAttribute('aria-label')
            })).filter(l => l.href && !l.href.includes('mailto'));
        });
        console.log('Sidebar Mapping:', sidebarLinks);
        fs.writeFileSync(path.join(artifactDir, 'veropm_sidebar_map.json'), JSON.stringify(sidebarLinks, null, 2));

        // 2. Refresh Templates and Wait
        console.log('Refreshing Templates with hydration wait...');
        await page.goto('https://veropm.app/templates');

        // Wait for skeleton loaders to be replaced by actual content
        // Looking for cards that are NOT skeleton loaders
        try {
            await page.waitForSelector('.bg-white.rounded-lg.border:not(:has(.animate-pulse))', { timeout: 15000 });
        } catch (e) {
            console.log('Timeout waiting for hydrated cards, proceeding with current state.');
        }

        await page.screenshot({ path: path.join(artifactDir, 'veropm_templates_hydrated.png'), fullPage: true });

        const templates = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.bg-white.rounded-lg.border, [role="button"]'));
            return cards.map(c => ({
                title: c.innerText.split('\n')[0].trim(),
                content: c.innerText.trim()
            })).filter(t => t.title.length > 2);
        });
        console.log('Discovered Templates:', templates);

        // 3. Drill into "Standard Project" if found
        const firstTemplate = page.locator('.bg-white.rounded-lg.border').first();
        if (await firstTemplate.isVisible()) {
            await firstTemplate.click();
            await page.waitForTimeout(4000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_template_drilldown.png'), fullPage: true });

            const fieldGroups = await page.evaluate(() => {
                const groups = Array.from(document.querySelectorAll('h2, h3, .section-header'));
                return groups.map(g => {
                    const section = g.innerText.trim();
                    const nextDiv = g.parentElement;
                    const labels = Array.from(nextDiv.querySelectorAll('label, .text-sm.text-gray-500'));
                    return {
                        section,
                        fields: labels.map(l => l.innerText.trim())
                    };
                });
            });
            fs.writeFileSync(path.join(artifactDir, 'veropm_project_schema_deep.json'), JSON.stringify(fieldGroups, null, 2));
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
