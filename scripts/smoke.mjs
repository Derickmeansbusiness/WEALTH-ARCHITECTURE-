/**
 * Route smoke test: builds nothing, expects a dev or preview server at BASE (default http://localhost:4173).
 * Visits every route, waits for network idle, captures console errors / page errors, and screenshots.
 * Usage: node scripts/smoke.mjs [BASE]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const ROUTES = [
  '/', '/academy', '/academy/wealth-foundations', '/academy/debt-credit-leverage', '/academy/trust-architecture', '/academy/the-family-office', '/academy/glossary', '/academy/bookmarks',
  '/map', '/lab', '/money-flow', '/waterfall', '/family-bank', '/trust-explorer', '/liability', '/timeline', '/governance',
  '/cases', '/cases/compare', '/claims', '/jurisdictions', '/jurisdictions/compare', '/sources', '/research', '/present', '/present/5',
  '/debt-credit-studio', '/debt-credit-studio/lessons', '/debt-credit-studio/lessons/1', '/debt-credit-studio/lessons/8', '/debt-credit-studio/leverage', '/debt-credit-studio/stress-test',
  '/debt-credit-studio/credit-profile', '/debt-credit-studio/capital-stack', '/debt-credit-studio/financing-map', '/debt-credit-studio/decision', '/debt-credit-studio/dashboard',
  '/debt-credit-studio/cases', '/debt-credit-studio/jurisdictions', '/debt-credit-studio/sources', '/debt-credit-studio/present',
];

mkdirSync('scripts/shots', { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const viewport of [{ width: 1440, height: 900, tag: 'desktop' }, { width: 390, height: 844, tag: 'mobile' }]) {
  const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`); });
  for (const r of ROUTES) {
    errors.length = 0;
    try {
      await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(900);
      const text = await page.evaluate(() => document.body.innerText.slice(0, 200000));
      const emptyish = text.trim().length < 80;
      const stub = /in production/i.test(text);
      const name = r.replace(/\//g, '_') || '_root';
      if (viewport.tag === 'desktop') await page.screenshot({ path: `scripts/shots/${name}.png`, fullPage: false });
      results.push({ route: r, vp: viewport.tag, errors: [...errors], emptyish, stub });
    } catch (e) {
      results.push({ route: r, vp: viewport.tag, errors: [`nav: ${e.message.slice(0, 200)}`], emptyish: true, stub: false });
    }
  }
  await ctx.close();
}
await browser.close();
let bad = 0;
for (const r of results) {
  const flag = r.errors.length || r.emptyish || r.stub;
  if (flag) bad++;
  console.log(`${flag ? '✗' : '✓'} [${r.vp}] ${r.route}${r.stub ? '  STUB' : ''}${r.emptyish ? '  EMPTY' : ''}`);
  for (const e of r.errors.slice(0, 3)) console.log(`     ${e}`);
}
console.log(`\n${results.length - bad}/${results.length} route checks clean`);
process.exit(bad ? 1 : 0);
