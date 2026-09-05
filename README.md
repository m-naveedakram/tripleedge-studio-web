# TripleEdge Studio website (`web2/`)

Static publisher site for **TripleEdge Studio** Android apps.

**Canonical production URL:** https://tripleedge-studio.vercel.app  
**Support:** zshn09171248@gmail.com

## Contents

| Path | Purpose |
|---|---|
| `index.html` | Homepage |
| `legal.html` | Legal hub (Play Console policy URLs) |
| `capy_trace/` | Capy Trace privacy, terms, support |
| `app-ads.txt` | AdMob authorized sellers (add your publisher line before release) |
| `robots.txt` / `sitemap.xml` | Crawling |
| `favicon.svg` / `site.webmanifest` | Branding |

## Deploy to Vercel (no framework)

1. Create a Vercel project pointing at this `web2/` folder as the **Root Directory**.
2. Framework Preset: **Other** (static). Build Command: leave empty. Output Directory: `.`
3. Keep the default `*.vercel.app` hostname or attach a custom domain. Canonical links assume `https://tripleedge-studio.vercel.app`.
4. Deploy and confirm:
   - https://tripleedge-studio.vercel.app/
   - https://tripleedge-studio.vercel.app/legal.html
   - https://tripleedge-studio.vercel.app/capy_trace/privacy.html

## Google Play Console URLs (Capy Trace)

- Privacy: `https://tripleedge-studio.vercel.app/capy_trace/privacy.html`
- Terms: `https://tripleedge-studio.vercel.app/capy_trace/terms.html`
- Support: `https://tripleedge-studio.vercel.app/capy_trace/support.html`

## GitHub

This folder is its own git repo (same pattern as Novixa-Labs `web/`). Push to your TripleEdge Studio GitHub account before connecting Vercel.
