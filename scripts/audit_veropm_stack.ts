import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM TECH STACK AUDIT START ---');
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

        const audit = await targetPage.evaluate(`(() => {
            const hasVar = (name) => typeof window[name] !== 'undefined';
            
            const results = {
                frameworks: {
                    react: !!document.querySelector('[data-reactroot], [data-react-helmet]'),
                    nextjs: hasVar('next') || !!document.querySelector('#__NEXT_DATA__'),
                    vue: hasVar('Vue') || !!document.querySelector('[data-v-'),
                    angular: !!document.querySelector('[ng-version]'),
                    vitals: hasVar('__next_vitals_report')
                },
                styling: {
                    tailwind: !!Array.from(document.styleSheets).find(s => {
                        try { return Array.from(s.cssRules).find(r => r.cssText.includes('--tw-')); } catch(e) { return false; }
                    }),
                    mui: !!document.querySelector('[class*="Mui"]'),
                    styled_components: !!document.querySelector('style[data-styled]'),
                    ant_design: !!document.querySelector('.ant-'),
                },
                infrastructure: {
                    sentry: hasVar('Sentry') || hasVar('__SENTRY__'),
                    google_analytics: hasVar('ga') || hasVar('gtag'),
                    intercom: hasVar('Intercom'),
                    hotjar: hasVar('hj'),
                    segment: hasVar('analytics')
                },
                meta: {
                    generator: document.querySelector('meta[name="generator"]')?.getAttribute('content'),
                    scripts: Array.from(document.scripts).map(s => s.src).filter(s => s.length > 0).slice(0, 5)
                }
            };
            return results;
        })()`);

        console.log('AUDIT RESULTS:', JSON.stringify(audit, null, 2));

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_tech_audit.json'), JSON.stringify(audit, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL AUDIT ERROR:', err);
    }
}

main();
