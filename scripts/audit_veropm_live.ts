import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM COMPREHENSIVE ACCESS & DATA AUDIT ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            // Support both veropm.app and app.veropm.app
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        const workspaceId = 'a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde';

        // Use the 'app.' subdomain as provided by the user
        const baseUrl = `https://app.veropm.app/workspace/${workspaceId}`;

        const modules = [
            { name: 'Dashboard', url: `${baseUrl}/dashboard` },
            { name: 'Projects', url: `${baseUrl}/projects` },
            { name: 'Proposals', url: `${baseUrl}/proposals` }
        ];

        const auditResults = {};

        for (const mod of modules) {
            console.log(`Auditing ${mod.name}...`);
            await page.goto(mod.url);
            await page.waitForTimeout(6000); // Heavy hydration wait

            const screenshotPath = path.join(artifactDir, `veropm_live_${mod.name.toLowerCase()}_audit.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });

            const data = await page.evaluate((mName) => {
                const info = { name: mName, restricted: false, contentSummary: {} };

                const text = document.body.innerText;
                if (text.includes('Access Restricted') || text.includes('don\'t have permission')) {
                    info.restricted = true;
                    return info;
                }

                // Extract Table Headers
                info.contentSummary.headers = Array.from(document.querySelectorAll('th, [role="columnheader"]'))
                    .map(h => h.innerText.trim())
                    .filter(Boolean);

                // Extract Kanban/Pipeline Stages
                info.contentSummary.stages = Array.from(document.querySelectorAll('.kanban-column-header, [data-testid*="stage"], h3'))
                    .map(s => s.innerText.trim())
                    .filter(t => t.length > 2 && t.length < 50);

                // Extract Widgets/Cards (for Dashboard)
                info.contentSummary.widgets = Array.from(document.querySelectorAll('.card-title, h2, h3'))
                    .map(w => w.innerText.trim())
                    .filter(t => t.length > 2 && t.length < 50);

                return info;
            }, mod.name);

            auditResults[mod.name] = data;
            console.log(`${mod.name} Audit:`, data);

            // If it's Projects or Proposals and not restricted, try to click a "Create" button to see fields
            if (!data.restricted && (mod.name === 'Projects' || mod.name === 'Proposals')) {
                console.log(`Attempting to open 'Create' modal for ${mod.name}...`);
                const createBtn = page.getByRole('button', { name: /create|add/i }).first();
                if (await createBtn.isVisible()) {
                    await createBtn.click();
                    await page.waitForTimeout(3000);

                    const modalScreenshot = path.join(artifactDir, `veropm_live_${mod.name.toLowerCase()}_create_modal.png`);
                    await page.screenshot({ path: modalScreenshot });

                    const fields = await page.evaluate(() => {
                        const labels = Array.from(document.querySelectorAll('label, .text-sm.font-medium'));
                        return labels.map(l => ({
                            label: l.innerText.trim(),
                            type: l.nextElementSibling?.tagName === 'SELECT' ? 'dropdown' : 'input'
                        })).filter(f => f.label.length > 1);
                    });
                    auditResults[mod.name].createFields = fields;

                    await page.keyboard.press('Escape');
                }
            }
        }

        fs.writeFileSync(path.join(artifactDir, 'veropm_live_audit_report.json'), JSON.stringify(auditResults, null, 2));
        console.log('Comprehensive Audit Complete.');

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
