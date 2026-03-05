import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM WORKSPACE DISCOVERY START ---');
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

        // Look for workspace switcher
        console.log('Searching for workspace switcher...');
        const workspaceBtn = page.locator('button:has-text("Fpsos"), .workspace-switcher, .avatar-initial').first();
        if (await workspaceBtn.isVisible()) {
            await workspaceBtn.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_workspace_list.png') });

            const workspaces = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('[role="menuitem"], .workspace-item, .select-item'));
                return items.map(el => el.innerText.trim()).filter(Boolean);
            });
            console.log('Workspaces found:', workspaces);
        }

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
