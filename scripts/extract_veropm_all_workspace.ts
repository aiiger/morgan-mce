import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM WORKSPACE DATA EXTRACTION START ---');
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
        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';
        const baseUrl = `https://veropm.app/workspace/${workspaceId}`;

        const modules = [
            { name: 'projects', url: `${baseUrl}/projects` },
            { name: 'proposals', url: `${baseUrl}/proposals` },
            { name: 'risks', url: `${baseUrl}/risks` }
        ];

        const results = {};

        for (const module of modules) {
            console.log(`Navigating to ${module.name}...`);
            await page.goto(module.url);
            await page.waitForTimeout(5000); // Allow hydration
            await page.screenshot({ path: path.join(artifactDir, `veropm_${module.name}_snapshot.png`), fullPage: true });

            const data = await page.evaluate(() => {
                const info = {};
                // List columns
                info.columns = Array.from(document.querySelectorAll('th, .table-header')).map(th => th.innerText.trim());
                // Kanban stages if present
                info.stages = Array.from(document.querySelectorAll('[data-rbd-droppable-id], .kanban-stage-name')).map(s => s.innerText.split('\n')[0].trim());
                // Field labels if a detail view is open
                info.labels = Array.from(document.querySelectorAll('label, dt, .text-gray-500')).map(l => l.innerText.trim());
                return info;
            });
            results[module.name] = data;
        }

        console.log('Extraction Result Summary:', results);
        fs.writeFileSync(path.join(artifactDir, 'veropm_detailed_functional_map.json'), JSON.stringify(results, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
