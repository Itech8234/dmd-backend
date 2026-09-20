import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, EnvelopeSimple, Clock, PaperPlaneRight } from '@phosphor-icons/react';
import { useToast } from '../components/Toast.jsx';
import { useReveal } from '../hooks/motion.js';

export default function Contact() {
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    setBusy(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'), email: fd.get('email'),
          subject: fd.get('subject'), message: fd.get('message'),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error((d && d.error) || 'Failed');
      }
      toast(t('contact.success'), 'success');
      e.target.reset();
    } catch (err) {
      toast(err.message === 'Failed' ? t('common.error') : err.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  const info = [
    { icon: MapPin, label: t('contact.office'), value: 'Damaturu, Yobe State, Nigeria' },
    { icon: Phone, label: t('contact.phoneLabel'), value: '+234 800 000 0000' },
    { icon: EnvelopeSimple, label: 'Email', value: 'info@dmdyobe.ng' },
    { icon: Clock, label: 'Hours', value: t('contact.hours') },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow">{t('brand.party')}</p>
        <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('contact.title')}</h1>
        <p className="lead mt-4 text-xl">{t('contact.lead')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {info.map((item, i) => {
            const Icon = item.icon;
            return (
              <div data-reveal key={i} className="card card-hover flex items-start gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300">
                  <Icon size={21} weight="bold" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{item.label}</p>
                  <p className="mt-1 font-semibold text-ink dark:text-white">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form data-reveal onSubmit={submit} className="card rounded-3xl p-7 md:p-9 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="field-label">{t('contact.name')} *</label>
              <input id="c-name" name="name" required minLength={3} className="field" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="c-email" className="field-label">{t('contact.email')} *</label>
              <input id="c-email" name="email" type="email" required className="field" autoComplete="email" />
            </div>
          </div>
          <div>
            <label htmlFor="c-subject" className="field-label">{t('contact.subject')} *</label>
            <input id="c-subject" name="subject" required minLength={3} className="field" />
          </div>
          <div>
            <label htmlFor="c-message" className="field-label">{t('contact.message')} *</label>
            <textarea id="c-message" name="message" required minLength={10} rows={6} className="field resize-y" />
          </div>
          <button type="submit" disabled={busy} className="btn btn-yellow btn-block group">
            {busy ? t('common.loading') : t('contact.submit')}
            <PaperPlaneRight size={16} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
