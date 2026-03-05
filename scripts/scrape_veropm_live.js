import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  console.log('--- LIVE VEROPM SCRAPE ---');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  let page = null;
  
  for (const context of contexts) {
    page = context.pages().find(p => p.url().includes('veropm'));
    if (page) break;
  }
  
  if (!page) {
    console.error('ERROR: No VeroPM tab found. Make sure Chrome has VeroPM open.');
    process.exit(1);
  }

  console.log('Found VeroPM tab:', page.url());

  // 1. Extract full sidebar navigation
  console.log('\n=== SIDEBAR NAVIGATION ===');
  const nav = await page.evaluate(() => {
    const links = [];
    const selectors = [
      'nav a', 'aside a', '[role="navigation"] a',
      'a[href*="/workspace/"]',
      '.sidebar a', '[class*="sidebar"] a', '[class*="nav"] a'
    ];
    
    const seen = new Set();
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => {
        const href = el.getAttribute('href') || '';
        const text = el.innerText?.trim() || '';
        const key = href || text;
        if (key && !seen.has(key) && text.length > 0 && text.length < 50) {
          seen.add(key);
          links.push({ text, href });
        }
      });
    }
    return links;
  });
  
  for (const link of nav) {
    console.log(`  ${link.text} → ${link.href}`);
  }

  // 2. Navigate to each section and capture structure
  const urlParts = page.url().split('/workspace/');
  const workspaceBase = urlParts[0] + '/workspace/' + urlParts[1].split('/')[0];
  
  const sections = [
    'dashboard', 'portfolios', 'proposal-pipeline', 'projects', 'templates',
    'workflows', 'automation', 'tasks', 'my-tasks', 'issues',
    'time-reports', 'documents', 'approve-timesheets', 'chat', 'meetings',
    'time-off-management', 'risks', 'resources/requests',
    'financial/approvals', 'financial/budgets', 'financial/expenses',
    'reports', 'settings'
  ];

  const sectionData = {};
  
  for (const section of sections) {
    const url = `${workspaceBase}/${section}`;
    console.log(`\n--- ${section} ---`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(2500);
      
      const data = await page.evaluate(() => {
        const result = {};
        
        result.url = window.location.href;
        result.is404 = document.body.innerText?.includes('Page not found') || false;
        
        result.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
          .map(el => el.innerText?.trim())
          .filter(t => t.length > 0 && t.length < 80);
        
        result.buttons = Array.from(document.querySelectorAll('button'))
          .map(el => el.innerText?.trim())
          .filter(t => t.length > 0 && t.length < 40);
        
        result.tableHeaders = Array.from(document.querySelectorAll('th'))
          .map(el => el.innerText?.trim());
        
        result.tabs = Array.from(document.querySelectorAll('[role="tab"]'))
          .map(el => el.innerText?.trim())
          .filter(t => t.length > 0 && t.length < 40);
        
        result.formLabels = Array.from(document.querySelectorAll('label'))
          .map(el => el.innerText?.trim())
          .filter(t => t.length > 0 && t.length < 50);
          
        // Stats/metrics/KPIs
        result.stats = Array.from(document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="kpi"]'))
          .slice(0, 10)
          .map(el => el.innerText?.trim().substring(0, 120));
        
        const main = document.querySelector('main') || document.body;
        result.summary = main?.innerText?.substring(0, 1500) || '';
        
        return result;
      });
      
      sectionData[section] = data;
      
      if (data.is404) {
        console.log(`  404`);
      } else {
        if (data.headings?.length) console.log(`  H: ${JSON.stringify(data.headings.slice(0, 5))}`);
        if (data.buttons?.length) console.log(`  B: ${JSON.stringify(data.buttons.slice(0, 8))}`);
        if (data.tableHeaders?.length) console.log(`  TH: ${JSON.stringify(data.tableHeaders.slice(0, 10))}`);
        if (data.tabs?.length) console.log(`  Tabs: ${JSON.stringify(data.tabs.slice(0, 8))}`);
      }
    } catch (err) {
      console.log(`  ERR: ${err.message?.substring(0, 80)}`);
      sectionData[section] = { error: err.message, section };
    }
  }

  // Save
  fs.writeFileSync('artifacts/veropm_live_scrape.json', JSON.stringify(sectionData, null, 2));
  console.log('\n=== SAVED artifacts/veropm_live_scrape.json ===');
  
  await browser.close();
}

main().catch(console.error);
