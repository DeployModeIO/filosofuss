#!/usr/bin/env node
/*
 * check-contrast.mjs — WCAG 2.1 relative-luminance contrast checker (no deps).
 *
 * Parses the `:root`, `html.light` and `html.paper` token blocks from
 * src/index.css and asserts the AA thresholds for the design-system pairs:
 *   - normal text  >= 4.5:1
 *   - large text / UI >= 3.0:1
 *
 * It also enforces that the text gradient utilities (.text-gradient /
 * .text-gradient-animated) never pull the wine `--accent-3` stop, and that every
 * gradient stop actually used for text clears 4.5:1 over the theme background.
 *
 * Exits non-zero on any failure. Run: `node scripts/check-contrast.mjs`
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CSS = readFileSync(resolve(ROOT, 'src/index.css'), 'utf8');

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

/* ------------------------------------------------------------------ */
/* CSS parsing                                                         */
/* ------------------------------------------------------------------ */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const cleanCss = stripComments(CSS);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function extractBlock(selector) {
  const re = new RegExp(`(?:^|[{}])\\s*${escapeRe(selector)}\\s*\\{([^}]*)\\}`, 'm');
  const m = cleanCss.match(re);
  return m ? m[1] : null;
}

function parseTokens(block) {
  const tokens = {};
  if (!block) return tokens;
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) tokens[m[1]] = m[2].trim();
  return tokens;
}

function parseHex(value) {
  if (value == null) return null;
  const m = String(value).trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/* ------------------------------------------------------------------ */
/* WCAG 2.1 contrast math                                              */
/* ------------------------------------------------------------------ */
const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const luminance = ({ r, g, b }) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/* ------------------------------------------------------------------ */
/* Themes + pairs                                                      */
/* ------------------------------------------------------------------ */
const themes = [
  { name: 'dark  (:root)', selector: ':root' },
  { name: 'light (html.light)', selector: 'html.light' },
  { name: 'paper (html.paper)', selector: 'html.paper' },
].map((t) => ({ ...t, tokens: parseTokens(extractBlock(t.selector)) }));

// `--on-accent` is the semantic "text over accent surfaces" token. Before this
// fix the codebase hardcoded the ink #0a0a12 in .btn-primary, so fall back to
// that legacy value when the token is absent (this is exactly what makes the
// current values fail).
function resolveOnAccent(tokens) {
  const t = tokens['--on-accent'] ?? tokens['--ink'];
  if (t) return t;
  return '#0a0a12';
}

const pairs = [
  { label: 'text/bg', fg: '--text', bg: '--bg', threshold: AA_NORMAL, kind: 'normal' },
  { label: 'muted/bg', fg: '--muted', bg: '--bg', threshold: AA_NORMAL, kind: 'normal' },
  { label: 'muted/bg-2', fg: '--muted', bg: '--bg-2', threshold: AA_NORMAL, kind: 'normal' },
  { label: 'accent/bg', fg: '--accent', bg: '--bg', threshold: AA_NORMAL, kind: 'normal' },
  { label: 'accent-2/bg', fg: '--accent-2', bg: '--bg', threshold: AA_NORMAL, kind: 'normal' },
  { label: 'on-accent/accent', fg: '__ON_ACCENT__', bg: '--accent', threshold: AA_NORMAL, kind: 'normal' },
  { label: 'on-accent/accent-2', fg: '__ON_ACCENT__', bg: '--accent-2', threshold: AA_NORMAL, kind: 'normal' },
];

/* ------------------------------------------------------------------ */
/* Text-gradient auditing                                              */
/* ------------------------------------------------------------------ */
const GRADIENT_CLASSES = ['.text-gradient', '.text-gradient-animated'];
const FORBIDDEN_STOPS = ['--accent-3'];

const gradients = GRADIENT_CLASSES.map((cls) => {
  const body = extractBlock(cls);
  const refs = [];
  if (body) {
    const re = /var\(\s*(--[\w-]+)\s*\)/g;
    let m;
    while ((m = re.exec(body))) refs.push(m[1]);
  }
  const raw = body ?? '';
  return {
    cls,
    found: body !== null,
    refs,
    hasForbidden:
      FORBIDDEN_STOPS.some((s) => refs.includes(s)) ||
      /#7a2e4d/i.test(raw),
  };
});

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */
const pad = (s, n) => String(s).padEnd(n);
const failures = [];
let checks = 0;

console.log('\n=== WCAG 2.1 contrast check — Filosofuss ===');
console.log(`CSS: src/index.css   thresholds: normal >= ${AA_NORMAL}:1, large/UI >= ${AA_LARGE}:1\n`);

for (const theme of themes) {
  console.log(`--- ${theme.name} ---`);
  console.log(`${pad('pair', 22)}${pad('fg', 12)}${pad('bg', 12)}${pad('ratio', 9)}${pad('min', 6)}result`);
  for (const pair of pairs) {
    checks++;
    const onAccent = resolveOnAccent(theme.tokens);
    const fgRaw = pair.fg === '__ON_ACCENT__' ? onAccent : theme.tokens[pair.fg];
    const bgRaw = theme.tokens[pair.bg];
    const fg = parseHex(fgRaw);
    const bg = parseHex(bgRaw);
    let r = null;
    let ok = false;
    let note = '';
    if (!fg || !bg) {
      note = `unresolved (${pair.fg === '__ON_ACCENT__' ? 'on-accent fallback' : pair.fg}=${fgRaw ?? 'missing'}, ${pair.bg}=${bgRaw ?? 'missing'})`;
    } else {
      r = ratio(fg, bg);
      ok = r >= pair.threshold;
      if (!ok) note = 'FAIL';
    }
    if (!ok) failures.push(`${theme.name} ${pair.label}${note ? ' — ' + note : ''}`);
    const ratioStr = r == null ? 'n/a' : r.toFixed(2) + ':1';
    console.log(
      `${pad(pair.label, 22)}${pad(fgRaw ?? '-', 12)}${pad(bgRaw ?? '-', 12)}${pad(ratioStr, 9)}${pad(pair.threshold.toFixed(1), 6)}${ok ? 'PASS' : 'FAIL'}`,
    );
  }

  // Text gradients must not use the wine accent-3, and every stop used for text
  // must clear 4.5:1 over the theme background.
  const bg = parseHex(theme.tokens['--bg']);
  for (const g of gradients) {
    if (!g.found) {
      checks++;
      failures.push(`${theme.name} ${g.cls} — utility block not found`);
      continue;
    }
    if (g.hasForbidden) {
      checks++;
      failures.push(`${theme.name} ${g.cls} — text gradient includes forbidden stop --accent-3 / #7a2e4d`);
    }
    for (const ref of g.refs) {
      checks++;
      const stop = parseHex(theme.tokens[ref]);
      const ok = Boolean(stop && bg) && ratio(stop, bg) >= AA_NORMAL;
      if (!ok) {
        failures.push(`${theme.name} ${g.cls} stop ${ref} — ${stop ? ratio(stop, bg).toFixed(2) + ':1' : 'unresolved'} < ${AA_NORMAL}:1`);
      }
    }
  }
  const gSummary = gradients
    .map((g) => `${g.cls}: ${g.refs.join(' -> ') || 'n/a'}${g.hasForbidden ? ' [FORBIDDEN accent-3]' : ''}`)
    .join('  |  ');
  console.log(`  gradients: ${gSummary}\n`);
}

console.log('=== Summary ===');
console.log(`checks: ${checks}   failures: ${failures.length}`);
if (failures.length) {
  for (const f of failures) console.log(`  FAIL: ${f}`);
  console.log('\nRESULT: FAIL — contrast/token issues present.\n');
  process.exit(1);
}
console.log('\nRESULT: PASS — every checked pair meets its AA threshold.\n');
