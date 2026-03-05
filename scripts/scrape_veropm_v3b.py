"""
VeroPM Scraper v3b - Scrape the 8 sub-sections missed in v3.
"""
import asyncio, json, pathlib
from playwright.async_api import async_playwright

BASE = "https://app.veropm.app/workspace/a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde"
OUT = pathlib.Path("artifacts/veropm-scrape-v3")

SECTIONS = [
    ("Capacity Planning",       "/resources/capacity"),
    ("Workload Balancing",      "/resources/balancing"),
    ("Expenses",                "/financial/expenses"),
    ("Financial Settings",      "/financial/settings"),
    ("Risk Alerts",             "/risks/alerts"),
    ("Alert Rules",             "/risks/alert-rules"),
    ("Issue Analytics",         "/issues/analytics"),
    ("Lesson Learned Analytics","/lessonlearned/analytics"),
]

async def extract(page):
    return await page.evaluate("""() => {
        const unique = arr => [...new Set(arr.filter(t => t))];
        const text = el => (el.innerText || '').trim();
        const qsa = sel => [...document.querySelectorAll(sel)];
        
        const headings = qsa('h1, h2, h3, h4')
            .map(h => ({tag: h.tagName, text: text(h)}))
            .filter(h => h.text);
        const buttons = unique(qsa('button, [role="button"]').map(b => text(b)).filter(t => t.length > 0 && t.length < 80)).slice(0, 40);
        const tableHeaders = unique(qsa('th, [role="columnheader"]').map(t => text(t)));
        const tabs = unique(qsa('[role="tab"], [data-state], button[class*="tab"], [class*="TabsTrigger"]').map(t => text(t)).filter(t => t.length < 60));
        const cards = qsa('[class*="card" i], [class*="stat" i], [class*="widget" i], [class*="metric" i]').slice(0, 15).map(c => text(c).substring(0, 300)).filter(c => c);
        const labels = unique(qsa('label, [class*="label" i]').map(l => text(l)).filter(t => t.length < 80)).slice(0, 25);
        const inputs = qsa('input, select, textarea').slice(0, 15).map(i => ({type: i.type || i.tagName.toLowerCase(), name: i.name || '', placeholder: i.placeholder || '', id: i.id || ''}));
        const mainEl = document.querySelector('main, [role="main"], [class*="content" i]:not(nav *)');
        const mainText = mainEl ? text(mainEl).substring(0, 600) : '';
        const chartCount = qsa('canvas, [class*="chart" i], [class*="recharts"]').length;
        const tableCount = qsa('table, [role="grid"]').length;
        const formCount = qsa('form').length;
        
        return { headings, buttons, tableHeaders, tabs, cards, labels, inputs, mainText, counts: { charts: chartCount, tables: tableCount, forms: formCount } };
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
    
    results = []
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
            print(f"OK ({nh}h {nb}b)")
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)[:200]
            print(f"FAIL: {str(e)[:80]}")
        results.append(result)
    
    out_file = OUT / "scrape_subsections.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    ok = sum(1 for r in results if r["status"] == "ok")
    print(f"\nDone! {ok}/{len(results)} succeeded. Saved to {out_file}")
    for r in results:
        s = "OK" if r["status"] == "ok" else "FAIL"
        if r["status"] == "ok":
            e = r["elements"]
            print(f"  [{s}] {r['name']}: h={len(e.get('headings',[]))} b={len(e.get('buttons',[]))} th={len(e.get('tableHeaders',[]))}")
        else:
            print(f"  [{s}] {r['name']}: {r.get('error','')[:60]}")

asyncio.run(main())
