import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './translations.js';

const STORAGE_KEY = 'dmd-lang';
// Bump CACHE_VERSION to force a fresh Google translation after EN copy changes.
const CACHE_VERSION = 'v2';
const CACHE_KEY = `dmd-ha-auto-${CACHE_VERSION}`;

export const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ha', label: 'HA', full: 'Hausa' },
];

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ha') return saved;
  } catch (e) {}
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('ha') ? 'ha' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: initialLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/* ------------------------------------------------------------------ */
/* Runtime auto-translation (Google Translate, free gtx endpoint)      */
/* ------------------------------------------------------------------ */

let translating = false;
const listeners = new Set();

function setTranslating(v) {
  translating = v;
  listeners.forEach((fn) => { try { fn(v); } catch (e) {} });
}

/** Subscribe to translating-state changes; returns an unsubscribe fn. */
export function onTranslatingChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isTranslating() {
  return translating;
}

// Protect {{interpolation}} placeholders so Google doesn't mangle them.
const PLACEHOLDER_RE = /\{\{[^}]+\}\}/g;
function shield(text) {
  const map = [];
  const out = text.replace(PLACEHOLDER_RE, () => `⟦{${map.length}}⟧`);
  return { out, map };
}
function unshield(text, map) {
  return text.replace(/⟦\{(\d+)\}⟧/g, (_, i) => map[+i]);
}

function gUrl(text) {
  return (
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ha&dt=t&q=' +
    encodeURIComponent(text)
  );
}

async function gTranslate(text, attempt = 0) {
  try {
    const { out, map } = shield(text);
    const res = await fetch(gUrl(out), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = (data[0] || []).map((x) => (x && x[0]) || '').join('');
    const restored = unshield(translated, map);
    return restored || text;
  } catch (err) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      return gTranslate(text, attempt + 1);
    }
    console.warn('[i18n] translation failed, keeping English:', text.slice(0, 60), err.message);
    return text; // graceful fallback
  }
}

async function runPool(texts, onProgress) {
  const out = new Array(texts.length);
  const queue = texts.map((t, i) => i);
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const i = queue.shift();
      out[i] = await gTranslate(texts[i]);
      onProgress?.();
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await Promise.all(workers);
  return out;
}

/* ------------------------------------------------------------------ */
/* Per-string translation for DB content (news, events, policies…)     */
/* ------------------------------------------------------------------ */

const STR_CACHE_KEY = 'dmd-ha-str-v1';
let strCache = null;
let strCacheDirty = false;

function loadStrCache() {
  try { return JSON.parse(localStorage.getItem(STR_CACHE_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveStrCache() {
  if (!strCacheDirty) return;
  try { localStorage.setItem(STR_CACHE_KEY, JSON.stringify(strCache)); } catch (e) {}
  strCacheDirty = false;
}
if (typeof window !== 'undefined') window.addEventListener('beforeunload', saveStrCache);

function looksTranslatable(s) {
  if (!s || s.length < 2) return false;
  // Skip URLs, e-mail, phone numbers, mostly-numeric strings.
  if (/^(https?:\/\/|\/|[\w.+-]+@[\w.-]+)/.test(s)) return false;
  if (!/[a-zA-Z]{3,}/.test(s)) return false;
  return true;
}

/**
 * Translate an array of English strings to Hausa.
 * Returns results in the same order; uses the per-string cache so each
 * unique string is only sent to Google once per browser.
 */
export async function translateBatch(texts, onProgress) {
  strCache ??= loadStrCache();
  const uniq = [...new Set(texts.filter(looksTranslatable))];
  const todo = uniq.filter((s) => !(s in strCache));
  if (todo.length) {
    setTranslating(true);
    try {
      let done = 0;
      const values = await runPool(todo, () => {
        done += 1;
        if (done % 25 === 0) console.log(`[i18n] DB strings: ${done}/${todo.length}…`);
      });
      todo.forEach((s, i) => { strCache[s] = values[i] || s; });
      strCacheDirty = true;
      saveStrCache();
    } finally {
      setTranslating(false);
    }
  }
  return texts.map((s) => (s && strCache[s]) || s || '');
}

function collectLeaves(node, path = [], out = []) {
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === 'object') collectLeaves(v, [...path, k], out);
    else out.push({ path: [...path, k], value: String(v) });
  }
  return out;
}

function rebuildTree(leaves, values) {
  const tree = {};
  leaves.forEach((leaf, i) => {
    let node = tree;
    leaf.path.slice(0, -1).forEach((k) => { node[k] ??= {}; node = node[k]; });
    node[leaf.path.at(-1)] = values[i];
  });
  return tree;
}

async function ensureHa() {
  // 1) Cached translation from a previous session?
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      i18n.addResourceBundle('ha', 'translation', JSON.parse(cached), true, true);
      return;
    }
  } catch (e) {}

  // 2) Translate every EN string now, with a progress indicator.
  setTranslating(true);
  try {
    const leaves = collectLeaves(en);
    let done = 0;
    const values = await runPool(leaves.map((l) => l.value), () => {
      done += 1;
      if (done % 50 === 0) console.log(`[i18n] Hausa: ${done}/${leaves.length} strings…`);
    });
    const tree = rebuildTree(leaves, values);
    i18n.addResourceBundle('ha', 'translation', tree, true, true);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(tree)); } catch (e) {}
  } finally {
    setTranslating(false);
  }
}

let haPromise = null;
function getHa() {
  haPromise ??= ensureHa().catch((e) => { haPromise = null; throw e; });
  return haPromise;
}

/* ------------------------------------------------------------------ */

export async function setLang(code) {
  try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  document.documentElement.lang = code;
  if (code === 'ha') {
    await getHa();
    await i18n.changeLanguage('ha');
  } else {
    await i18n.changeLanguage(code);
  }
}

// Returning visitor who prefers Hausa: start on English, auto-translate,
// then switch as soon as the Hausa bundle is ready.
if (initialLang() === 'ha') {
  document.documentElement.lang = 'ha';
  getHa().then(() => i18n.changeLanguage('ha')).catch(() => {});
}

export default i18n;
