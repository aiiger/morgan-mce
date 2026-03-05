import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM TEMPLATE EXPLORATION START ---');
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

        // Navigate to Templates
        console.log('Navigating to Templates...');
        const templatesLink = page.getByRole('link', { name: /templates/i }).first();
        if (await templatesLink.isVisible()) {
            await templatesLink.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_templates_list.png') });

            const templateSections = await page.evaluate(() => {
                const results = {};
                // Find tabs or sections (e.g., Project Templates, Proposal Templates)
                const tabs = Array.from(document.querySelectorAll('[role="tab"], button')).filter(t => t.innerText.length > 3);
                results.tabs = tabs.map(t => t.innerText.trim());

                // Get visible template names
                results.templates = Array.from(document.querySelectorAll('h3, .template-name, .text-lg')).map(h => h.innerText.trim());
                return results;
            });
            console.log('Template Info:', templateSections);

            // Click into a Project Template if available
            const projectTemplate = page.getByText(/project template/i).first();
            if (await projectTemplate.isVisible()) {
                await projectTemplate.click();
                await page.waitForTimeout(3000);
                await page.screenshot({ path: path.join(artifactDir, 'veropm_project_template_detail.png') });

                const fields = await page.evaluate(() => {
                    const labels = Array.from(document.querySelectorAll('label, .field-label, dt'));
                    return labels.map(l => l.innerText.trim()).filter(Boolean);
                });
                console.log('Project Template Fields:', fields);
                fs.writeFileSync(path.join(artifactDir, 'veropm_project_fields.json'), JSON.stringify(fields, null, 2));
            }
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
