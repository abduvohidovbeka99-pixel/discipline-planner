// Renders PWA icons from an SVG template using the preinstalled Chromium.
// Usage: node scripts/gen-icons.mjs  (needs `playwright` resolvable, e.g. npm i -D playwright)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { writeFileSync } from 'node:fs';

const glyph = `<path d="M9 31L32 11l23 20" fill="none" stroke="#4b4663" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 29v22a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V29L32 17z" fill="#4b4663"/><rect x="26" y="37" width="12" height="18" rx="3" fill="#ebe8f5"/><circle cx="46" cy="44" r="11" fill="#a58bdc"/><path d="M41 44l3.5 3.5 6-6.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;

// pad = share of the canvas left around the glyph; rounded = draw iOS-like squircle
const svg = ({ pad, rounded, bg = true }) => {
  const s = 64 * (1 - 2 * pad);
  const o = 64 * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#ebebf1"/><stop offset="1" stop-color="#c9c9d3"/></linearGradient></defs>${
    bg ? (rounded ? '<rect width="64" height="64" rx="15" fill="url(#g)"/>' : '<rect width="64" height="64" fill="url(#g)"/>') : ''
  }<g transform="translate(${o} ${o}) scale(${s / 64})">${glyph}</g></svg>`;
};

writeFileSync('public/favicon.svg', svg({ pad: 0.12, rounded: true }));

const browser = await chromium.launch();
const page = await browser.newPage();
const render = async (file, size, opts) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg(opts)}`);
  await page.screenshot({ path: 'public/' + file, omitBackground: true });
};
await render('pwa-192.png', 192, { pad: 0.14, rounded: true });
await render('pwa-512.png', 512, { pad: 0.14, rounded: true });
await render('pwa-maskable-512.png', 512, { pad: 0.22, rounded: false });
await render('apple-touch-icon.png', 180, { pad: 0.16, rounded: false });
await browser.close();
console.log('icons written to public/');
