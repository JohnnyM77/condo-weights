"""Wrap src/page.html (the same file published as the Claude artifact) into a
full phone-ready page at public/index.html for Cloudflare."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / "src/page.html").read_text()
head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#eef0ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111415" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Condo">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest" crossorigin="use-credentials">
<link rel="icon" href="favicon-32.png?v=xander" sizes="32x32" type="image/png">
<link rel="icon" href="favicon-16.png?v=xander" sizes="16x16" type="image/png">
<link rel="icon" href="favicon-64.png?v=xander" sizes="64x64" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=xander">
<style>
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;font:14px system-ui,-apple-system,sans-serif;overscroll-behavior-y:none}
img{max-width:100%}
[hidden]{display:none!important}
button,input{touch-action:manipulation}
</style>
</head>
<body>
"""
(root / "public/index.html").write_text(head + body + "\n</body>\n</html>\n")
print("built public/index.html")
