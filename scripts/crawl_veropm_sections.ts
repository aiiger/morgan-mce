import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM FULL FUNCTIONAL CRAWL START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: VeroPM tab not found.');
            process.exit(1);
        }

        const sections = [
            { name: 'Dashboard', url: '/dashboard' },
            { name: 'Portfolios', url: '/portfolios' },
            { name: 'Proposal Pipeline', url: '/proposal-pipeline' },
            { name: 'Projects', url: '/projects' },
            { name: 'Templates', url: '/templates' },
            { name: 'Workflows', url: '/workflows' },
            { name: 'Automation', url: '/automation' },
            { name: 'My Tasks', url: '/my-tasks' },
            { name: 'Issues', url: '/issues' },
            { name: 'Time Reports', url: '/time-reports' },
            { name: 'Documents', url: '/documents' },
            { name: 'Approve Timesheets', url: '/approve-timesheets' },
            { name: 'Chat', url: '/chat' },
            { name: 'Meetings', url: '/meetings' },
            { name: 'Time-Off Management', url: '/time-off-management' }
        ];

        const fullMap = {};

        for (const section of sections) {
            console.log(`Crawling: ${section.name}...`);
            try {
                // Find and click the navigation link by text
                const navLink = page.getByRole('link', { name: section.name, exact: true });
                if (await navLink.count() > 0) {
                    await navLink.click();
                    await page.waitForTimeout(2000); // Wait for navigation and data fetch
                } else {
                    console.warn(`Link for ${section.name} not found, trying URL navigation...`);
                    const currentUrl = page.url();
                    const baseUrl = currentUrl.split('/workspace/')[0] + '/workspace/' + currentUrl.split('/workspace/')[1].split('/')[0];
                    await page.goto(`${baseUrl}${section.url}`);
                    await page.waitForTimeout(2000);
                }

                const extraction = await page.evaluate(() => {
                    const getElements = (selector) => Array.from(document.querySelectorAll(selector)).map(el => el.innerText.trim()).filter(t => t.length > 0);

                    return {
                        title: document.title,
                        headings: getElements('h1, h2, h3'),
                        primaryButtons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.length > 0 && t.length < 30).slice(0, 10),
                        tableHeaders: Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim()),
                        forms: Array.from(document.querySelectorAll('input, select')).map(i => i.placeholder || i.name || i.ariaLabel).filter(Boolean).slice(0, 10),
                        summary: document.body.innerText.substring(0, 500).replace(/\\n/g, ' ')
                    };
                });

                fullMap[section.name] = extraction;

                // Screenshot for visual reference
                const screenshotPath = `C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6/veropm_${section.name.toLowerCase().replace(/\\s/g, '')}.png`;
                await page.screenshot({ path: screenshotPath });
                console.log(`Saved screenshot for ${section.name}`);

            } catch (secErr) {
                console.error(`Error crawling ${section.name}:`, secErr.message);
                fullMap[section.name] = { error: secErr.message };
            }
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_full_functional_map.json'), JSON.stringify(fullMap, null, 2));

        console.log('FULL CRAWL COMPLETED');
        await browser.close();
    } catch (err) {
        console.error('FATAL CRAWL ERROR:', err);
    }
}

main();
