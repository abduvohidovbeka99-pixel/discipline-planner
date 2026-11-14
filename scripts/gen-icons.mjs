// Renders PWA icons from an SVG template using the preinstalled Chromium.
// Usage: node scripts/gen-icons.mjs  (needs `playwright` resolvable, e.g. npm i -D playwright)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { writeFileSync } from 'node:fs';

// Mountain peak with a flag: discipline as a climb to the summit.
const glyph = `<path d="M6 52L24 24l7 10 7-12 20 30z" fill="#a58bdc"/><path d="M24 24l5.5 8-3 1.5-2.5-3-2.5 3-3-1.5z" fill="#ebe6f5"/><path d="M38 22l6.5 10-3.5 1.5-3-3.5-3 3.5-3-1z" fill="#ebe6f5"/><path d="M38 22V9" stroke="#ebe6f5" stroke-width="2.4" stroke-linecap="round"/><path d="M38 9.5h11l-3 4 3 4H38z" fill="#f3a53b"/>`;

// pad = share of the canvas left around the glyph; rounded = draw iOS-like squircle
const svg = ({ pad, rounded, bg = true }) => {
  const s = 64 * (1 - 2 * pad);
  const o = 64 * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#3a2d63"/><stop offset="1" stop-color="#14111b"/></linearGradient></defs>${
    bg ? (rounded ? '<rect width="64" height="64" rx="15" fill="url(#g)"/>' : '<rect width="64" height="64" fill="url(#g)"/>') : ''
  }<g transform="translate(${o} ${o}) scale(${s / 64})">${glyph}</g></svg>`;
};

writeFileSync('public/favicon.svg', svg({ pad: 0.04, rounded: true }));

const browser = await chromium.launch();
const page = await browser.newPage();
const render = async (file, size, opts) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg(opts)}`);
  await page.screenshot({ path: 'public/' + file, omitBackground: true });
};
await render('pwa-192.png', 192, { pad: 0.06, rounded: true });
await render('pwa-512.png', 512, { pad: 0.06, rounded: true });
await render('pwa-maskable-512.png', 512, { pad: 0.17, rounded: false });
await render('apple-touch-icon.png', 180, { pad: 0.09, rounded: false });
await browser.close();
console.log('icons written to public/');
