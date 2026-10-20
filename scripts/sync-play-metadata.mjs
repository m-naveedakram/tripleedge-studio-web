/**
 * Fetches public Play Store listing title + icon for each package (og: meta).
 * Run before deploy: node scripts/sync-play-metadata.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outFile = path.join(root, 'data', 'play-metadata.json');

/** @type {string[]} */
const LIVE_PACKAGES = [
  'com.tripleedgestudio.capytrace',
  'com.tripleedgestudio.coloring',
  'com.tripleedgestudio.neontracing',
  'com.tripleedgestudio.dimly',
  'com.tripleedgestudio.neonfocussleep',
  'com.tripleedgestudio.shimejipets',
  'com.tripleedgestudio.gifgenerator',
  'com.tripleedgestudio.arrows',
  'com.tripleedgestudio.neonfocus',
  'com.tripleedgestudio.avatarprompts',
  'com.tripleedgestudio.iconprompt',
  'com.tripleedgestudio.anime',
  'com.tripleedgestudio.babykickcounter',
];

const REVIEW_COUNT = 4;
const LIVE_COUNT = LIVE_PACKAGES.length;

function decodeHtml(raw) {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanTitle(raw) {
  if (!raw) return '';
  return decodeHtml(raw)
    .replace(/\s*[-–—]\s*Apps on Google Play\s*$/i, '')
    .replace(/\s*[-–—]\s*Google Play\s*$/i, '')
    .trim();
}

async function fetchListing(packageId) {
  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageId)}&hl=en&gl=us`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; TripleEdgeStudioSiteSync/1.0; +https://tripleedge-studio.vercel.app)',
    },
  });
  if (!res.ok) throw new Error(`${packageId}: HTTP ${res.status}`);
  const html = await res.text();
  const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const title = cleanTitle(titleMatch?.[1]);
  let icon = imageMatch?.[1] || '';
  if (icon && !icon.includes('=w')) icon = `${icon}=w256-h256`;
  return {packageId, title, icon};
}

async function main() {
  const apps = {};
  for (const packageId of LIVE_PACKAGES) {
    try {
      const meta = await fetchListing(packageId);
      apps[packageId] = {title: meta.title, icon: meta.icon};
      console.log(`OK  ${packageId} → ${meta.title}`);
    } catch (err) {
      console.warn(`WARN ${packageId}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    liveCount: LIVE_COUNT,
    reviewCount: REVIEW_COUNT,
    apps,
  };
  fs.mkdirSync(path.dirname(outFile), {recursive: true});
  fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outFile} (${Object.keys(apps).length} apps)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
