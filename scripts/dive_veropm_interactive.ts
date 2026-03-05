import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM INTERACTIVE DISCOVERY START ---');
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

        console.log('Current Page URL:', page.url());

        const modules = ['Proposal Pipeline', 'Projects', 'Risk Register'];

        for (const module of modules) {
            console.log(`Searching for ${module} link...`);
            const link = page.getByRole('link', { name: new RegExp(module, 'i') }).first();

            if (await link.isVisible()) {
                console.log(`Clicking ${module}...`);
                await link.click();
                await page.waitForTimeout(6000); // Heavy wait for construction app hydration

                const screenshotPath = path.join(artifactDir, `veropm_${module.toLowerCase().replace(' ', '_')}_final.png`);
                await page.screenshot({ path: screenshotPath, fullPage: true });
                console.log(`Screenshot saved to ${screenshotPath}`);

                const data = await page.evaluate((modName) => {
                    const info = { module: modName };
                    // Table Headers
                    info.headers = Array.from(document.querySelectorAll('th, [role="columnheader"]')).map(h => h.innerText.trim()).filter(Boolean);
                    // Kanban Stages
                    info.kanbanStages = Array.from(document.querySelectorAll('.kanban-column-header, [data-testid*="kanban-stage"]')).map(s => s.innerText.trim());
                    // Filters/Buttons (Shows functionality)
                    info.actions = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.length > 3);
                    return info;
                }, module);

                fs.writeFileSync(path.join(artifactDir, `veropm_${module.toLowerCase().replace(' ', '_')}_data.json`), JSON.stringify(data, null, 2));
            } else {
                console.log(`${module} link not found visually.`);
            }
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
