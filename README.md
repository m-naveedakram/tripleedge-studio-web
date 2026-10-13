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
| `rollcall/` | Anime Prompt Builder legal pages |
| `gif_maker/` | GIF Maker privacy, terms, support |
| `dimly/` | Dimly legal pages |
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

## Baby Kick Counter & Tracker

Folder: baby_kick_counter/ (privacy.html, terms.html, support.html, icon.png).
Package: com.tripleedgestudio.babykickcounter.
Pages reflect the current app: local records, base Firebase only, optional debug test ads; release ads and billing disabled. Review pages when enabling production features.

## Khmer Keyboard

Folder: `khmer_keyboard/`. Developer: TripleEdge Studio. Package: `com.tripleedgestudio.khmerkeyboard`.

- Privacy: https://tripleedge-studio.vercel.app/khmer_keyboard/privacy.html
- Terms: https://tripleedge-studio.vercel.app/khmer_keyboard/terms.html
- Support: https://tripleedge-studio.vercel.app/khmer_keyboard/support.html
- `icon.png` is an unchanged copy of the approved Android xxxhdpi launcher asset (76,232 bytes), not a new design or a large original image.

These are planned production URLs, not a claim that these local pages are deployed. A homepage Utilities card, legal-hub entry and sitemap entries reuse existing styles. No unverified Play Store listing or publication status is claimed.

### Repository structure and deployment inspection

All 13 existing app folders have `privacy.html`, `terms.html`, `support.html`: `arrows`, `avatar_prompt`, `baby_kick_counter`, `capy_trace`, `coloring`, `dimly`, `focus_frame`, `gif_maker`, `glow_line`, `icon prompt generator`, `neon_focus`, `rollcall`, `shimeji_pets`. Arrows additionally has `play.html` and a developer-specific `sync-levels.mjs`; baby_kick_counter, coloring, glow_line and icon prompt generator also have local icons. The space-separated icon-prompt path is a legacy exception; new app folders follow lower-case snake_case.

The homepage and legal hub have inline dark publisher-site styles and navigation; the homepage also has a shared company footer. App legal pages are standalone white documents with duplicated inline Arial styles, company email and sibling/all-app links, not framework components or a shared CSS import. The new pages copy the baby_kick_counter style block exactly.

Routing is direct static HTML paths, with canonical links, robots.txt, sitemap.xml, site.webmanifest and favicon.svg. There is no router, package.json, framework build, CI workflow or checked-in Vercel rewrite configuration. The legacy instructions above mention `web2/`, but this repository's actual static files are at its root. Confirm the Vercel project's configured Root Directory matches this checkout and serve its static root with Other framework preset, no build command and output `.`. Existing live deployment settings were not inspected or changed.

Validation: run `node validate-site.mjs` and `git diff --check`. There is no framework compilation step. The Arrows sync script is a content-writing maintenance tool with another developer's hardcoded paths, not a safe site build command; it is not executed.

### Content verification and publication blockers

Content was checked against the existing local Android project on October 13, 2026, including KeyboardSettings, ClipboardHistoryPolicy, EncryptedClipboardHistoryRepository, KhmerKeyboardService, AndroidSpeechRecognitionGateway, FirebasePrivacy, AndroidManifest/backup rules, AdEligibility/KeyboardApp, PlayBillingRepository, FirebasePlayPurchaseVerifier and Firebase Functions source. Provider references are linked in the policy; those provider documents do not establish the publisher's live Console settings.

Before approving publication, the owner must confirm:

1. The distributed app matches this source. Purchase verification backend deployment, Play product activation, App Check, Play API permissions and RTDN are not verified live; the preceding local work did not deploy them. Pages describe unavailable checkout honestly and conditional server processing. Confirm live purchase/refund/restore behavior before claiming availability.
2. Firebase Analytics/Crashlytics configured retention, actual data locations and any deletion process; Firestore billing-record, runtime-log and support-email retention/deletion policies. No fixed server/provider/support retention period or deletion SLA has been invented. The source has no billing-record expiry/deletion workflow. Local clipboard durations, default and pruning behavior are directly verified in code.
3. Publisher legal entity/address, applicable jurisdiction, intended age/target audience and any jurisdiction-specific notices or legal basis that must be supplied. Existing company name/email are reused; no address, governing law, age threshold, no-sale statement or additional contact mailbox is invented.
4. The shared repository support mailbox `zshn09171248@gmail.com` is also the approved Khmer Keyboard support/privacy contact. Its presence is verified in README and existing pages; inbox ownership/responsiveness has not been tested.
5. Vercel root-directory settings, final canonical host and any Google Play Data Safety disclosures. No deployment, email, commit or push is performed by the local page addition.

Policy provider references: https://firebase.google.com/support/privacy, https://developers.google.com/admob/android/privacy/play-data-disclosure, https://developer.android.com/reference/android/speech/SpeechRecognizer.
