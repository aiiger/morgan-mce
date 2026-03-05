import asyncio
import json
import os

async def main():
    from playwright.async_api import async_playwright

    sections = [
        ("Dashboard", "/dashboard"),
        ("Portfolios", "/portfolios"),
        ("Proposal Pipeline", "/proposal-pipeline"),
        ("Projects", "/projects"),
        ("Templates", "/templates"),
        ("Workflows", "/workflows"),
        ("Automation", "/automation"),
        ("My Tasks", "/tasks"),
        ("Issues", "/issues"),
        ("Time Reports", "/time-reports"),
        ("Documents", "/documents"),
        ("Approve Timesheets", "/approve-timesheets"),
        ("Chat", "/chat"),
        ("Meetings", "/meetings"),
        ("Time-Off Management", "/time-off-management"),
        ("Financial Approvals", "/financial/approvals"),
        ("Risks", "/risks"),
        ("Risks Heat Map", "/risks/heat-map"),
        ("Resources Requests", "/resources/requests"),
        ("Settings", "/settings"),
        ("Budgets", "/budgets"),
        ("Reports", "/reports"),
    ]

    workspace = "a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde"
    base = f"https://app.veropm.app/workspace/{workspace}"
    out_dir = "artifacts/veropm-scrape-2026-03-03"
    os.makedirs(out_dir, exist_ok=True)

    pw = await async_playwright().start()
    browser = await pw.chromium.connect_over_cdp("http://localhost:9222")
    contexts = browser.contexts
    page = None
    for ctx in contexts:
        for p in ctx.pages:
            if "veropm" in p.url:
                page = p
                break
        if page:
            break

    if not page:
        print("ERROR: No VeroPM tab found")
        return

    results = {}

    for name, path in sections:
        print(f"Scraping: {name} ({path})...")
        try:
            await page.goto(f"{base}{path}", wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(2000)

            data = await page.evaluate("""() => {
                const getText = (sel) => Array.from(document.querySelectorAll(sel)).map(e => e.innerText.trim()).filter(t => t.length > 0);
                
                // Get sidebar nav items
                const navItems = Array.from(document.querySelectorAll('nav a, aside a, [role="navigation"] a')).map(a => ({
                    text: a.innerText.trim(),
                    href: a.getAttribute('href') || ''
                })).filter(n => n.text.length > 0 && n.text.length < 50);

                // Get main content
                const headings = getText('h1, h2, h3, h4');
                const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.length > 0 && t.length < 40).slice(0, 20);
                const tableHeaders = getText('th');
                const tabItems = getText('[role="tab"], [data-state]');
                const cards = getText('[class*="card"] h3, [class*="card"] h4, [class*="Card"] h3');
                const labels = getText('label');
                const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(i => ({
                    type: i.tagName.toLowerCase(),
                    placeholder: i.placeholder || '',
                    name: i.name || '',
                    label: i.getAttribute('aria-label') || ''
                })).filter(f => f.placeholder || f.name || f.label).slice(0, 20);
                
                // Get KPI/metric cards
                const metrics = getText('[class*="metric"], [class*="kpi"], [class*="stat"]');
                
                // Get empty states
                const emptyStates = getText('[class*="empty"], [class*="no-data"], [class*="placeholder"]');
                
                // Get all visible text (trimmed)
                const bodyText = document.body.innerText.substring(0, 3000);

                return {
                    url: window.location.href,
                    title: document.title,
                    navItems,
                    headings,
                    buttons,
                    tableHeaders,
                    tabItems,
                    cards,
                    labels,
                    inputs,
                    metrics,
                    emptyStates,
                    bodyText
                };
            }""")

            results[name] = data

            # Take screenshot
            safe_name = name.lower().replace(" ", "_").replace("/", "_")
            await page.screenshot(path=f"{out_dir}/{safe_name}.png", full_page=True)
            print(f"  OK - {len(data.get('headings', []))} headings, {len(data.get('buttons', []))} buttons, {len(data.get('tableHeaders', []))} table cols")

        except Exception as e:
            print(f"  FAILED: {e}")
            results[name] = {"error": str(e)}

    # Save full results
    with open(f"{out_dir}/full_scrape.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nDone! Results saved to {out_dir}/full_scrape.json")
    await pw.stop()

asyncio.run(main())
