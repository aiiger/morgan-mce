"""
VeroPM Scraper v3 - No screenshots, just DOM extraction.
Connects to Chrome via CDP on port 9222.
"""
import asyncio, json, pathlib
from playwright.async_api import async_playwright

BASE = "https://app.veropm.app/workspace/a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde"
OUT = pathlib.Path("artifacts/veropm-scrape-v3")
OUT.mkdir(parents=True, exist_ok=True)

SECTIONS = [
    ("Dashboard",            "/dashboard"),
    ("Portfolios",           "/portfolios"),
    ("Proposal Pipeline",    "/proposal-pipeline"),
    ("Projects",             "/projects"),
    ("Templates",            "/templates"),
    ("Workflows",            "/workflows"),
    ("Automation",           "/automation"),
    ("My Tasks",             "/tasks"),
    ("Issues",               "/issues"),
    ("Time Reports",         "/time-reports"),
    ("Documents",            "/documents"),
    ("Approve Timesheets",   "/approve-timesheets"),
    ("Meetings",             "/meetings"),
    ("Time-Off Management",  "/time-off-management"),
    ("Financial Approvals",  "/financial/approvals"),
    ("Risks",                "/risks"),
    ("Risks Heat Map",       "/risks/heat-map"),
    ("Resources Requests",   "/resources/requests"),
    ("Settings",             "/settings"),
    ("Budgets",              "/budgets"),
    ("Reports",              "/reports"),
    ("Chat",                 "/chat"),
]

async def extract(page):
    """Extract all interesting DOM elements from current page."""
    return await page.evaluate("""() => {
        const unique = arr => [...new Set(arr.filter(t => t))];
        const text = el => (el.innerText || '').trim();
        const qsa = sel => [...document.querySelectorAll(sel)];
        
        // Nav items from sidebar
        const navItems = qsa('nav a, [role="navigation"] a, aside a, [class*="sidebar"] a')
            .map(a => ({text: text(a), href: a.getAttribute('href')}))
            .filter(n => n.text && n.text.length < 100);
        
        // Headings
        const headings = qsa('h1, h2, h3, h4')
            .map(h => ({tag: h.tagName, text: text(h)}))
            .filter(h => h.text);
        
        // Buttons
        const buttons = unique(
            qsa('button, [role="button"]')
            .map(b => text(b))
            .filter(t => t.length > 0 && t.length < 80)
        ).slice(0, 40);
        
        // Table headers
        const tableHeaders = unique(
            qsa('th, [role="columnheader"]').map(t => text(t))
        );
        
        // Tabs
        const tabs = unique(
            qsa('[role="tab"], [data-state], button[class*="tab"], [class*="TabsTrigger"]')
            .map(t => text(t))
            .filter(t => t.length < 60)
        );
        
        // Card/metric/stat content 
        const cards = qsa('[class*="card" i], [class*="stat" i], [class*="widget" i], [class*="metric" i]')
            .slice(0, 15)
            .map(c => text(c).substring(0, 300))
            .filter(c => c);
        
        // Labels
        const labels = unique(
            qsa('label, [class*="label" i]')
            .map(l => text(l))
            .filter(t => t.length < 80)
        ).slice(0, 25);
        
        // Inputs/selects
        const inputs = qsa('input, select, textarea')
            .slice(0, 15)
            .map(i => ({
                type: i.type || i.tagName.toLowerCase(),
                name: i.name || '',
                placeholder: i.placeholder || '',
                id: i.id || ''
            }));
        
        // Links
        const links = qsa('a[href]')
            .map(a => ({text: text(a).substring(0, 80), href: a.getAttribute('href')}))
            .filter(l => l.text || (l.href && l.href.startsWith('/')));
        
        // Empty states
        const emptyStates = qsa('[class*="empty" i], [class*="no-data" i], [class*="placeholder" i], [class*="zero-state" i]')
            .map(e => text(e).substring(0, 200))
            .filter(t => t);
        
        // Charts/canvas
        const chartCount = qsa('canvas, [class*="chart" i], [class*="recharts"]').length;
        const tableCount = qsa('table, [role="grid"]').length;
        const formCount = qsa('form').length;
        
        // Body text sample from main area
        const mainEl = document.querySelector('main, [role="main"], [class*="content" i]:not(nav *)');
        const mainText = mainEl ? text(mainEl).substring(0, 600) : '';
        
        return {
            navItems, headings, buttons, tableHeaders, tabs,
            cards, labels, inputs, links: links.slice(0, 30),
            emptyStates, mainText,
            counts: { charts: chartCount, tables: tableCount, forms: formCount }
        };
    }""")


async def main():
    pw = await async_playwright().start()
    browser = await pw.chromium.connect_over_cdp("http://localhost:9222")
    
    contexts = browser.contexts
    if not contexts:
        print("No browser contexts found!")
        return
    
    page = contexts[0].pages[0]
    print(f"Connected to: {page.url}")
    
    all_results = []
    
    for name, path in SECTIONS:
        print(f"Scraping: {name} ({path})...", end=" ", flush=True)
        result = {"name": name, "path": path, "status": "ok"}
        
        try:
            await page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(3500)
            
            data = await extract(page)
            result["elements"] = data
            
            nh = len(data.get("headings", []))
            nb = len(data.get("buttons", []))
            nt = len(data.get("tableHeaders", []))
            print(f"OK ({nh}h {nb}b {nt}t)")
            
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)[:200]
            print(f"FAIL: {str(e)[:80]}")
        
        all_results.append(result)
    
    # Save
    out_file = OUT / "scrape.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    ok = sum(1 for r in all_results if r["status"] == "ok")
    print(f"\nDone! {ok}/{len(all_results)} succeeded. Saved to {out_file}")
    
    # Quick summary
    for r in all_results:
        s = "OK" if r["status"] == "ok" else "FAIL"
        if r["status"] == "ok":
            e = r["elements"]
            print(f"  [{s}] {r['name']}: h={len(e.get('headings',[]))} b={len(e.get('buttons',[]))} th={len(e.get('tableHeaders',[]))} tabs={len(e.get('tabs',[]))} charts={e.get('counts',{}).get('charts',0)}")
        else:
            print(f"  [{s}] {r['name']}: {r.get('error','')[:60]}")

asyncio.run(main())
