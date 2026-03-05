import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM HEAVY EXTRACTION START ---');
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

        const modules = [
            { name: 'Proposal Pipeline', urlPath: `/workspace/${workspaceId}/proposals` },
            { name: 'Projects', urlPath: `/workspace/${workspaceId}/projects` }
        ];

        const finalMap = {};

        for (const mod of modules) {
            console.log(`Auditing ${mod.name}...`);
            await page.goto(`https://veropm.app${mod.urlPath}`);

            // Wait for any table or kanban to appear
            try {
                await page.waitForSelector('th, .kanban-column, .text-lg.font-bold', { timeout: 10000 });
            } catch (e) {
                console.log(`Notice: Timeout waiting for main elements in ${mod.name}, proceeding anyway.`);
            }

            await page.waitForTimeout(3000); // Animation buffer
            await page.screenshot({ path: path.join(artifactDir, `veropm_audit_${mod.name.toLowerCase().replace(' ', '_')}.png`), fullPage: true });

            const data = await page.evaluate((mName) => {
                const res = { module: mName, fields: [], structure: [] };

                // Extract Columns
                const ths = Array.from(document.querySelectorAll('th'));
                if (ths.length > 0) res.structure = ths.map(t => t.innerText.trim());

                // Extract Kanban Stages
                const stages = Array.from(document.querySelectorAll('.kanban-column-header, h3'));
                if (stages.length > 0 && res.structure.length === 0) {
                    res.structure = stages.map(s => s.innerText.trim()).filter(t => t.length > 2);
                }

                return res;
            }, mod.name);

            // Trigger "Add" Modal to see fields
            console.log(`Attempting to open 'Add/Create' modal for ${mod.name}...`);
            const addButton = page.getByRole('button', { name: /add|create/i }).first();
            if (await addButton.isVisible()) {
                await addButton.click();
                await page.waitForTimeout(3000);
                await page.screenshot({ path: path.join(artifactDir, `veropm_audit_${mod.name.toLowerCase().replace(' ', '_')}_modal.png`) });

                const modalFields = await page.evaluate(() => {
                    const labels = Array.from(document.querySelectorAll('label, .text-sm.font-medium, .field-label'));
                    return labels.map(l => ({
                        label: l.innerText.trim(),
                        type: l.nextElementSibling?.tagName === 'SELECT' ? 'dropdown' : 'input'
                    })).filter(f => f.label.length > 1);
                });
                data.fields = modalFields;

                // Close modal
                await page.keyboard.press('Escape');
            }

            finalMap[mod.name] = data;
        }

        fs.writeFileSync(path.join(artifactDir, 'veropm_audit_results.json'), JSON.stringify(finalMap, null, 2));
        console.log('Heavy Audit Complete.');

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
