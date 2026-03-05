import urllib.request, json, time

time.sleep(5)
try:
    resp = urllib.request.urlopen("http://localhost:9222/json")
    data = json.loads(resp.read())
    for tab in data:
        title = tab.get("title", "")
        url = tab.get("url", "")
        print(f"Tab: {title} - {url}")
except Exception as e:
    print(f"Error connecting: {e}")
