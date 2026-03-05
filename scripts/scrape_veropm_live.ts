import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  console.log('--- LIVE VEROPM SCRAPE ---');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  let page: any = null;
  
  for (const context of contexts) {
    page = context.pages().find((p: any) => p.url().includes('veropm'));
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
    const links: any[] = [];
    // Try multiple selectors for sidebar nav
    const selectors = [
      'nav a', 'aside a', '[role="navigation"] a',
      'a[href*="/workspace/"]',
      '.sidebar a', '[class*="sidebar"] a', '[class*="nav"] a'
    ];
    
    const seen = new Set();
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el: any) => {
        const href = el.getAttribute('href') || '';
        const text = el.innerText?.trim() || '';
        const key = href || text;
        if (key && !seen.has(key) && text.length > 0 && text.length < 50) {
          seen.add(key);
          links.push({ text, href, classes: el.className?.substring(0, 100) || '' });
        }
      });
    }
    return links;
  });
  
  for (const link of nav) {
    console.log(`  ${link.text} → ${link.href}`);
  }

  // 2. Extract dashboard content structure
  console.log('\n=== DASHBOARD CONTENT ===');
  const dashboard = await page.evaluate(() => {
    const result: any = {};
    
    // KPI cards
    result.kpiCards = Array.from(document.querySelectorAll('[class*="card"], [class*="stat"], [class*="kpi"], [class*="metric"]'))
      .slice(0, 20)
      .map((el: any) => el.innerText?.trim().substring(0, 100));
    
    // Headings
    result.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
      .map((el: any) => el.innerText?.trim())
      .filter((t: string) => t.length > 0 && t.length < 80);
    
    // Buttons
    result.buttons = Array.from(document.querySelectorAll('button'))
      .map((el: any) => el.innerText?.trim())
      .filter((t: string) => t.length > 0 && t.length < 40)
      .slice(0, 20);
    
    // Tables
    result.tableHeaders = Array.from(document.querySelectorAll('th'))
      .map((el: any) => el.innerText?.trim());
    
    // Main text content summary
    const main = document.querySelector('main') || document.querySelector('[class*="content"]') || document.body;
    result.textSummary = main?.innerText?.substring(0, 2000) || '';
    
    return result;
  });
  
  console.log('Headings:', dashboard.headings);
  console.log('Buttons:', dashboard.buttons);
  console.log('Table Headers:', dashboard.tableHeaders);
  console.log('KPI Cards:', dashboard.kpiCards?.slice(0, 5));
  
  // 3. Navigate to each section and capture structure
  const workspaceBase = page.url().split('/dashboard')[0] || page.url().split('/workspace/')[0] + '/workspace/' + page.url().split('/workspace/')[1]?.split('/')[0];
  
  const sections = [
    'dashboard', 'portfolios', 'proposal-pipeline', 'projects', 'templates',
    'workflows', 'automation', 'tasks', 'my-tasks', 'issues',
    'time-reports', 'documents', 'approve-timesheets', 'chat', 'meetings',
    'time-off-management', 'risks', 'resources/requests',
    'financial/approvals', 'financial/budgets', 'financial/expenses',
    'reports', 'settings'
  ];

  const sectionData: Record<string, any> = {};
  
  for (const section of sections) {
    const url = `${workspaceBase}/${section}`;
    console.log(`\n--- Navigating to: ${section} ---`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.waitForTimeout(2000);
      
      const data = await page.evaluate((sName: string) => {
        const result: any = { section: sName, url: window.location.href };
        
        // Check if page exists (not 404)
        result.is404 = document.body.innerText?.includes('404') || 
                       document.body.innerText?.includes('not found') ||
                       document.body.innerText?.includes('Page not found');
        
        // Headings
        result.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
          .map((el: any) => el.innerText?.trim())
          .filter((t: string) => t.length > 0 && t.length < 80);
        
        // Buttons
        result.buttons = Array.from(document.querySelectorAll('button'))
          .map((el: any) => el.innerText?.trim())
          .filter((t: string) => t.length > 0 && t.length < 40);
        
        // Table columns
        result.tableHeaders = Array.from(document.querySelectorAll('th'))
          .map((el: any) => el.innerText?.trim());
        
        // Form fields
        result.formLabels = Array.from(document.querySelectorAll('label'))
          .map((el: any) => el.innerText?.trim())
          .filter((t: string) => t.length > 0 && t.length < 50);
        
        // Tabs
        result.tabs = Array.from(document.querySelectorAll('[role="tab"], [data-state], .tab'))
          .map((el: any) => el.innerText?.trim())
          .filter((t: string) => t.length > 0 && t.length < 40);
        
        // Cards
        result.cards = Array.from(document.querySelectorAll('[class*="card"]'))
          .slice(0, 10)
          .map((el: any) => el.innerText?.trim().substring(0, 100));
        
        // Content summary  
        const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
        result.summary = main?.innerText?.substring(0, 1000) || '';
        
        return result;
      }, section);
      
      sectionData[section] = data;
      
      if (data.is404) {
        console.log(`  → 404 / Not found`);
      } else {
        console.log(`  Headings: ${JSON.stringify(data.headings?.slice(0, 5))}`);
        console.log(`  Buttons: ${JSON.stringify(data.buttons?.slice(0, 8))}`);
        console.log(`  Tables: ${JSON.stringify(data.tableHeaders?.slice(0, 8))}`);
        console.log(`  Tabs: ${JSON.stringify(data.tabs?.slice(0, 8))}`);
      }
    } catch (err: any) {
      console.log(`  → Error: ${err.message?.substring(0, 100)}`);
      sectionData[section] = { error: err.message, section };
    }
  }

  // Save full output
  const outputPath = 'artifacts/veropm_live_scrape.json';
  fs.writeFileSync(outputPath, JSON.stringify(sectionData, null, 2));
  console.log(`\n=== SAVED TO ${outputPath} ===`);
  
  await browser.close();
}

main().catch(console.error);
