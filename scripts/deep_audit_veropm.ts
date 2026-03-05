import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM DEEP TECH AUDIT START ---');
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

        const deepAudit = await targetPage.evaluate(`(() => {
            const results = {};
            
            // 1. Framework Detection (Improved)
            results.framework = {
                isReact: !!(window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || document.querySelector('[data-reactroot]') || Array.from(document.querySelectorAll('*')).some(el => Object.keys(el).some(k => k.startsWith('__react')))),
                isNextjs: !!(window.next || document.querySelector('#__NEXT_DATA__')),
                isVite: !!(window.__vite_plugin_react_preamble_installed__ || Array.from(document.scripts).some(s => s.src.includes('vite'))),
                isVue: !!(window.__VUE__ || document.querySelector('[data-v-')),
                isSvelte: !!Array.from(document.querySelectorAll('*')).some(el => Object.keys(el).some(k => k.startsWith('__svelte'))),
            };

            // 2. Styling (More thorough)
            results.styling = {
                tailwind: !!Array.from(document.styleSheets).find(s => {
                    try { 
                        return Array.from(s.cssRules || []).some(r => r.cssText.includes('--tw-') || r.cssText.includes('tailwindcss')); 
                    } catch(e) { return false; }
                }),
                shadcn: !!document.querySelector('[data-radix-collection]') || !!document.querySelector('[class*="lucide"]'),
                radix: !!document.querySelector('[data-radix-collection]'),
                lucide: !!document.querySelector('[class*="lucide"]'),
                framerMotion: !!Array.from(document.querySelectorAll('*')).some(el => el.getAttribute && el.getAttribute('style')?.includes('x:')),
            };

            // 3. State Management / Data Fetching
            results.state = {
                reactQuery: !!window.__REACT_QUERY_DEVTOOLS__ || !!window.queryClient,
                redux: !!window.__REDUX_DEVTOOLS_EXTENSION__,
                zustand: !!window.__ZUSTAND_STATE__,
                swr: !!window.__SWR_CACHE__
            };

            // 4. Infrastructure / Services
            results.services = {
                supabase: !!Array.from(document.scripts).some(s => s.src.includes('supabase')),
                firebase: !!window.firebase || !!Array.from(document.scripts).some(s => s.src.includes('firebase')),
                clerk: !!window.Clerk,
                sentry: !!window.Sentry || !!window.__SENTRY__,
                posthog: !!window.posthog,
                segment: !!window.analytics,
                pusher: !!window.Pusher
            };

            // 5. API / Backend Endpoints
            results.api = {
                domains: Array.from(performance.getEntriesByType('resource'))
                    .map(e => new URL(e.name).hostname)
                    .filter((h, i, a) => a.indexOf(h) === i && !h.includes('veropm.app') && !h.includes('google') && !h.includes('gstatic'))
            };

            return results;
        })()`);

        console.log('DEEP AUDIT RESULTS:', JSON.stringify(deepAudit, null, 2));

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        fs.writeFileSync(path.join(artifactDir, 'veropm_deep_audit.json'), JSON.stringify(deepAudit, null, 2));

        await browser.close();
    } catch (err) {
        console.error('FATAL AUDIT ERROR:', err);
    }
}

main();
