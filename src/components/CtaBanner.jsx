import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, WhatsappLogo } from '@phosphor-icons/react';
import { useToast } from './Toast.jsx';
import api from '../lib/api.js';

export default function CtaBanner() {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(12400);

  useEffect(() => {
    let cancelled = false;
    api('/stats').then((s) => { if (!cancelled && s.volunteers != null) setCount(s.volunteers); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function subscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await api('/subscribe', { method: 'POST', body: { email: email.trim() } });
      toast(t('home.joinSuccess'), 'success');
      setEmail('');
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section data-reveal className="section-tight" aria-labelledby="cta-title">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 via-yellow-400 to-red-500 p-8 md:p-14 shadow-card-hover">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-ink-950/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute top-8 right-1/4 h-40 w-40 rounded-full bg-red-800/25 blur-3xl" aria-hidden="true" />
        <div className="texture-grid absolute inset-0 opacity-30" aria-hidden="true" />

        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 id="cta-title" className="font-display text-3xl font-black leading-tight text-ink-950 text-balance md:text-4xl">
              {t('home.ctaTitle')}
            </h2>
            <p className="mt-4 max-w-md text-ink-950/80 leading-relaxed">{t('home.ctaText')}</p>
            <ul className="mt-6 space-y-2.5">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-ink-950/90">
                  <CheckCircle size={17} weight="fill" className="text-red-700 shrink-0" aria-hidden="true" />
                  {t(`home.ctaItem${i}`)}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/volunteer" className="btn btn-primary group">
                {t('home.ctaBtn')}
                <ArrowRight size={16} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="https://wa.me/2348000000000?text=I%20want%20to%20volunteer%20for%20DMD"
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-ink-950/30 text-ink-950 hover:bg-ink-950/10"
              >
                <WhatsappLogo size={17} weight="bold" aria-hidden="true" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-950/20 bg-white/30 p-6 backdrop-blur-sm">
            <div className="font-display text-4xl font-black text-ink-950">{count.toLocaleString()}+</div>
            <p className="mt-1 text-sm font-semibold text-ink-950/90">{t('home.joinTitle', { count: '' }).replace('+', '')}</p>
            <p className="mt-2 text-sm text-ink-950/70">{t('home.joinText')}</p>
            <form onSubmit={subscribe} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <label htmlFor="cta-email" className="sr-only">{t('home.joinPlaceholder')}</label>
              <input
                id="cta-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('home.joinPlaceholder')}
                className="grow rounded-xl border border-ink-950/25 bg-white/40 px-4 py-3 text-sm text-ink-950 placeholder-ink-950/40 focus:outline-none focus:border-ink-950 focus:ring-4 focus:ring-ink-950/20 transition"
              />
              <button type="submit" disabled={busy} className="btn btn-primary shrink-0">{busy ? '…' : t('home.joinBtn')}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
