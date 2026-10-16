import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const git = (...args) => execFileSync('git', args, {cwd:root, encoding:'utf8', maxBuffer:64 * 1024 * 1024});
const baseline = name => git('show', `HEAD:${name}`);
const normalize = value => value.replace(/\r\n/g, '\n');
const stripRaw = html => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
const style = html => html.match(/<style>([\s\S]*?)<\/style>/)?.[1].replace(/\r\n/g, '\n');
const existing = git('ls-tree', '-r', '--name-only', 'HEAD').trim().split('\n');
const allowedChanges = new Set(['index.html','legal.html','sitemap.xml','README.md','validate-site.mjs']);
const changed = git('diff', '--name-only', 'HEAD').trim().split('\n').filter(Boolean);
assert(changed.every(name => allowedChanges.has(name) || name.startsWith('khmer_keyboard/') || name.startsWith('pocket_soundboard/')), `Unexpected tracked modifications: ${changed}`);
const preserved = existing.filter(name => !allowedChanges.has(name) && !name.startsWith('khmer_keyboard/'));
for (const name of preserved) {
  const actual = fs.readFileSync(path.join(root, name));
  const original = execFileSync('git', ['show', `HEAD:${name}`], {cwd:root, maxBuffer:64 * 1024 * 1024});
  assert(name.endsWith('.png') ? actual.equals(original) : normalize(actual.toString('utf8')) === normalize(original.toString('utf8')), `Existing file changed: ${name}`);
}
for (const name of ['index.html','legal.html']) {
  assert.equal(style(read(name)), style(baseline(name)), `${name} styles changed`);
  // Compare surrounding markup, allowing this app's entry both before and after an approved commit.
  if (name === 'index.html') {
    const removeCard = input => ['khmer_keyboard','pocket_soundboard'].reduce((html, app) => {
      const pos = html.indexOf(`src="${app}/icon.png"`);
      if (pos < 0) return html;
      const start = html.lastIndexOf('\n\n          <article', pos);
      const end = html.indexOf('</article>', pos) + '</article>'.length;
      assert(start >= 0 && end > pos);
      return html.slice(0,start)+html.slice(end);
    }, normalize(input));
    assert.equal(removeCard(read(name)).trimEnd().replace(/\n{3,}/g,'\n\n'), removeCard(baseline(name)).trimEnd().replace(/\n{3,}/g,'\n\n'), 'Existing homepage markup changed');
  } else {
    const removeBlock = html => normalize(html)
      .replace(/      <div class="app-block">\n        <h2>Pocket Soundboard<\/h2>[\s\S]*?        <\/div>\n      <\/div>\n/, '')
      .replace(/        <\/div>\n      <\/div>\n      <p class="support-note">/, '        </div>\n      <p class="support-note">');
    assert.equal(removeBlock(read(name)).trimEnd(), removeBlock(baseline(name)).trimEnd(), 'Existing legal hub markup changed');
  }
}

const pages = ['privacy','terms','support'];
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
for (const [app, packageName] of [['khmer_keyboard','com.tripleedgestudio.khmerkeyboard'],['pocket_soundboard','com.novixalabs.pocketsoundboard']]) for (const page of pages) {
  const name = `${app}/${page}.html`;
  const html = read(name);
  assert(html.startsWith('<!DOCTYPE html>'));
  assert(html.includes(packageName));
  assert(html.includes('mailto:zshn09171248@gmail.com'));
  assert(html.includes(`rel="canonical" href="https://tripleedge-studio.vercel.app/${name}"`));
  assert(html.includes('name="viewport"'));
  assert(!html.includes('\uFFFD'), 'Invalid UTF-8 replacement character');
  assert.equal(style(html), style(read('baby_kick_counter/privacy.html')), 'Legal template styles differ');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const sibling of pages) assert(html.includes(`href="${sibling}.html"`));
  const stack = [];
  for (const tag of stripRaw(html).matchAll(/<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g)) {
    const name = tag[1].toLowerCase();
    if (tag[0].startsWith('</')) assert.equal(stack.pop(), name, `Unbalanced tag in ${page}: ${tag[0]}`);
    else if (!voidTags.has(name) && !tag[0].endsWith('/>')) stack.push(name);
  }
  assert.equal(stack.length, 0, `Unclosed tags in ${page}`);
}

function htmlFiles(directory) {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    if (entry.name === '.git') return [];
    const full = path.join(directory,entry.name);
    return entry.isDirectory() ? htmlFiles(full) : entry.name.endsWith('.html') ? [full] : [];
  });
}
function brokenLinks(name, html) {
  const missing = [];
  for (const tag of stripRaw(html).matchAll(/<(?:a|link|img|script)\b[^>]*>/gi)) {
    for (const attr of tag[0].matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
      const href = attr[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) continue;
      const relative = decodeURIComponent(href.split(/[?#]/)[0]);
      const target = relative.startsWith('/') ? path.join(root,relative) : path.resolve(root,path.dirname(name),relative);
      if (!fs.existsSync(target)) missing.push(`${name}: ${href}`);
    }
  }
  return missing;
}
const baselineBroken = new Set(existing.filter(name => name.endsWith('.html')).flatMap(name => brokenLinks(name, baseline(name))));
const files = htmlFiles(root);
let newBroken = [];
let existingBroken = [];
for (const full of files) {
  const name = path.relative(root,full).replaceAll('\\','/');
  for (const link of brokenLinks(name,fs.readFileSync(full,'utf8'))) {
    (baselineBroken.has(link) ? existingBroken : newBroken).push(link);
  }
}
assert.equal(newBroken.length,0, `New broken links: ${newBroken.join('\n')}`);
const locations = html => Array.from(html.matchAll(/<loc>([^<]+)<\/loc>/g), match => match[1]);
const oldLocations = locations(baseline('sitemap.xml'));
const newLocations = locations(read('sitemap.xml'));
assert(oldLocations.every(url => newLocations.includes(url)), 'Existing sitemap URL removed');
for (const app of ['khmer_keyboard','pocket_soundboard']) for (const page of pages) assert.equal(newLocations.filter(url => url === `https://tripleedge-studio.vercel.app/${app}/${page}.html`).length, 1);
const introducedUrls = ['khmer_keyboard','pocket_soundboard'].flatMap(app => pages.map(page => `https://tripleedge-studio.vercel.app/${app}/${page}.html`)).filter(url => !oldLocations.includes(url)).length;
assert.equal(newLocations.length,oldLocations.length+introducedUrls);
JSON.parse(read('site.webmanifest'));
console.log(`PASS: ${pages.length * 2} app documents have balanced markup, metadata, sibling navigation and exact template styles.`);
console.log(`PASS: checked local links/assets across ${files.length} HTML pages; no new broken links.`);
console.log(`PASS: ${preserved.length} other tracked files unchanged; existing homepage/legal markup and styles preserved.`);
console.log(`PASS: all ${oldLocations.length} baseline sitemap URLs retained; all three app URLs present exactly once; manifest parses.`);
if (existingBroken.length) console.warn(`PRE-EXISTING WARNINGS:\n${existingBroken.join('\n')}`);
console.log('Static structural checks only: external services, deployment and full HTML conformance are not validated.');
