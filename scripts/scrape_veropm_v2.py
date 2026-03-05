"""
VeroPM Full Scraper v2 - Uses domcontentloaded + explicit waits instead of networkidle.
Connects to Chrome via CDP on port 9222.
"""
import asyncio, json, os, pathlib
from playwright.async_api import async_playwright

BASE = "https://app.veropm.app/workspace/a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde"
OUT = pathlib.Path("artifacts/veropm-scrape-v2")
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

async def scrape_section(page, name, path):
    """Navigate to a section and extract UI elements."""
    slug = path.strip("/").replace("/", "_")
    result = {"name": name, "path": path, "status": "ok", "elements": {}}
    
    try:
        # Use domcontentloaded - doesn't wait for network idle
        await page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=30000)
        # Wait for SPA to render
        await page.wait_for_timeout(4000)
        
        # Take screenshot
        await page.screenshot(path=str(OUT / f"{slug}.png"), full_page=True)
        
        # Extract page title
        result["page_title"] = await page.title()
        
        # Extract sidebar nav items
        nav_items = await page.eval_on_selector_all(
            "nav a, [role='navigation'] a, aside a",
            "els => els.map(e => ({text: e.innerText.trim(), href: e.getAttribute('href')}))"
        )
        result["elements"]["nav_items"] = [n for n in nav_items if n["text"]]
        
        # Extract all headings
        headings = await page.eval_on_selector_all(
            "h1, h2, h3, h4",
            "els => els.map(e => ({tag: e.tagName, text: e.innerText.trim()}))"
        )
        result["elements"]["headings"] = [h for h in headings if h["text"]]
        
        # Extract buttons
        buttons = await page.eval_on_selector_all(
            "button, [role='button'], a[class*='btn']",
            "els => els.map(e => e.innerText.trim()).filter(t => t && t.length < 100)"
        )
        result["elements"]["buttons"] = list(set(buttons))[:30]
        
        # Extract table headers
        table_headers = await page.eval_on_selector_all(
            "th, [role='columnheader']",
            "els => els.map(e => e.innerText.trim()).filter(t => t)"
        )
        result["elements"]["table_headers"] = list(set(table_headers))
        
        # Extract tabs
        tabs = await page.eval_on_selector_all(
            "[role='tab'], [data-state], .tab, button[class*='tab']",
            "els => els.map(e => e.innerText.trim()).filter(t => t && t.length < 50)"
        )
        result["elements"]["tabs"] = list(set(tabs))
        
        # Extract cards / stat widgets
        cards = await page.eval_on_selector_all(
            "[class*='card'], [class*='stat'], [class*='widget'], [class*='metric']",
            "els => els.slice(0, 20).map(e => e.innerText.trim().substring(0, 200))"
        )
        result["elements"]["cards"] = [c for c in cards if c][:15]
        
        # Extract form labels / inputs
        labels = await page.eval_on_selector_all(
            "label, [class*='label']",
            "els => els.map(e => e.innerText.trim()).filter(t => t && t.length < 80)"
        )
        result["elements"]["labels"] = list(set(labels))[:20]
        
        # Extract select/dropdown options visible
        selects = await page.eval_on_selector_all(
            "select option, [role='option'], [role='listbox'] [role='option']",
            "els => els.map(e => e.innerText.trim()).filter(t => t)"
        )
        result["elements"]["select_options"] = list(set(selects))[:20]
        
        # Extract empty state messages
        empty = await page.eval_on_selector_all(
            "[class*='empty'], [class*='no-data'], [class*='placeholder']",
            "els => els.map(e => e.innerText.trim()).filter(t => t)"
        )
        result["elements"]["empty_states"] = empty[:5]
        
        # Extract main content text (first 500 chars)
        main_text = await page.eval_on_selector_all(
            "main, [role='main'], .content, #content",
            "els => els.map(e => e.innerText.trim().substring(0, 500))"
        )
        result["elements"]["main_text"] = main_text[:2]
        
        # Check for specific UI patterns
        has_table = await page.eval_on_selector_all("table, [role='grid']", "els => els.length")
        has_kanban = await page.eval_on_selector_all("[class*='kanban'], [class*='board'], [class*='column']", "els => els.length")
        has_chart = await page.eval_on_selector_all("canvas, svg[class*='chart'], [class*='chart']", "els => els.length")
        has_calendar = await page.eval_on_selector_all("[class*='calendar'], [class*='datepicker']", "els => els.length")
        
        result["ui_patterns"] = {
            "has_table": has_table > 0,
            "has_kanban": has_kanban > 0,
            "has_chart": has_chart > 0,
            "has_calendar": has_calendar > 0,
        }
        
        print(f"  OK: {len(result['elements'].get('headings', []))} headings, {len(result['elements'].get('buttons', []))} buttons, {len(result['elements'].get('table_headers', []))} table cols")
        
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)[:200]
        print(f"  FAILED: {str(e)[:100]}")
    
    return result


async def main():
    pw = await async_playwright().start()
    browser = await pw.chromium.connect_over_cdp("http://localhost:9222")
    
    # Use existing page
    contexts = browser.contexts
    if not contexts:
        print("No browser contexts found!")
        return
    
    page = contexts[0].pages[0]
    print(f"Connected to: {page.url}")
    
    all_results = []
    
    for name, path in SECTIONS:
        print(f"Scraping: {name} ({path})...")
        result = await scrape_section(page, name, path)
        all_results.append(result)
    
    # Write results
    out_file = OUT / "full_scrape.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    print(f"\nDone! Results saved to {out_file}")
    print(f"Successful: {sum(1 for r in all_results if r['status'] == 'ok')}/{len(all_results)}")
    
    # Print summary
    for r in all_results:
        status = "OK" if r["status"] == "ok" else "FAIL"
        headings = len(r.get("elements", {}).get("headings", []))
        buttons = len(r.get("elements", {}).get("buttons", []))
        print(f"  [{status}] {r['name']}: {headings}h {buttons}b")


asyncio.run(main())
