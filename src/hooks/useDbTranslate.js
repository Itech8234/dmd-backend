import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateBatch } from '../i18n/index.js';

// DB fields that should never be sent to translation (machine values / URLs).
const SKIP_FIELDS = new Set([
  'slug', 'cover_url', 'image_url', 'portrait_url', 'video_url',
  'email', 'phone', 'lang', 'code', 'letter', 'kind', 'category',
]);

function collect(node, pairs) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((n, i) => {
      if (typeof n === 'string') {
        if (n) pairs.push([n, (out) => { node[i] = out; }]);
      } else collect(n, pairs);
    });
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (SKIP_FIELDS.has(k)) continue;
    if (typeof v === 'string') {
      if (v) pairs.push([v, (out) => { node[`${k}_ha`] = out; }]);
    } else if (v && typeof v === 'object') {
      collect(v, pairs);
    }
  }
}

/**
 * Attaches Hausa translations to API data in-place (a shallow-cloned copy).
 * When the active language is English, the data is passed through untouched.
 * Usage: const items = useDbTranslate(rawItems);
 */
export default function useDbTranslate(data) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [out, setOut] = useState(data);

  useEffect(() => {
    let cancelled = false;
    if (lang !== 'ha' || !data) {
      setOut(data);
      return;
    }
    const clone = JSON.parse(JSON.stringify(data));
    const pairs = [];
    collect(clone, pairs);
    if (!pairs.length) {
      setOut(clone);
      return;
    }
    translateBatch(pairs.map(([s]) => s)).then((values) => {
      if (cancelled) return;
      pairs.forEach(([, apply], i) => apply(values[i]));
      setOut(clone);
    });
    return () => { cancelled = true; };
  }, [data, lang]);

  return out;
}
