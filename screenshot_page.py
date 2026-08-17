#!/usr/bin/env python3
"""
Utility: capture a full-page screenshot of any local URL.
Usage: python screenshot_page.py <url> <output_filename> [width]
"""
import sys
from playwright.sync_api import sync_playwright

def capture(url: str, output: str = "screenshot.png", width: int = 1440):
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.goto(url, wait_until="networkidle", timeout=30000)
        # Scroll once to trigger lazy-loaded content
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(800)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(400)
        page.screenshot(path=output, full_page=True)
        browser.close()
        print(f"Screenshot saved: {output}")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
    out = sys.argv[2] if len(sys.argv) > 2 else "screenshot.png"
    w = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
    capture(url, out, w)
