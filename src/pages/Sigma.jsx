import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowsDownUp, Lightbulb, ChartLine, Heartbeat, Plant, ShieldCheck,
  Globe, GraduationCap, Briefcase, Tractor, DeviceMobile, Users,
  Drop, HandHeart, Eye, CaretDown,
} from '@phosphor-icons/react';
import SectionTitle from '../components/SectionTitle.jsx';
import { useReveal } from '../hooks/motion.js';
import api from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

// Fallback = the S.I.G.M.A. manifesto content (also seeded in Django and
// admin-editable there). Used only if the API is unreachable.
const FALLBACK = [
  { letter: 'S', name: 'Supervision', description: 'Real-time project tracking, financial accountability and stronger delivery monitoring.' },
  { letter: 'I', name: 'Innovation', description: 'Digital government designed to reduce bureaucracy and improve public services.' },
  { letter: 'G', name: 'Growth', description: 'Education reform, entrepreneurship, SMEs, skills development and industrial diversification.' },
  { letter: 'M', name: 'Medicine', description: 'Accessible and quality healthcare for every citizen.' },
  { letter: 'A', name: 'Agriculture', description: 'Technology-driven agriculture transforming farmers into modern commercial producers.' },
];

const PILLAR_ICONS = { S: Eye, I: Lightbulb, G: ChartLine, M: Heartbeat, A: Plant };

// Five Historic Pillars — the manifesto's second architecture.
const HISTORIC = [
  { icon: ShieldCheck, key: 'security', tone: 'bg-red-100 text-red-600 dark:bg-red/20 dark:text-red-400' },
  { icon: Drop, key: 'energy', tone: 'bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300' },
  { icon: GraduationCap, key: 'human', tone: 'bg-ink-100 text-ink-700 dark:bg-ink-500/25 dark:text-ink-200' },
  { icon: HandHeart, key: 'dignity', tone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { icon: Globe, key: 'gateway', tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300' },
];

const AGENDA = [
  { icon: ShieldCheck, key: 'security' },
  { icon: GraduationCap, key: 'education' },
  { icon: Heartbeat, key: 'healthcare' },
  { icon: Briefcase, key: 'jobs' },
  { icon: Tractor, key: 'agriculture' },
  { icon: DeviceMobile, key: 'digital' },
  { icon: Drop, key: 'energy' },
  { icon: Lightbulb, key: 'youth' },
  { icon: Users, key: 'inclusion' },
];

export default function Sigma() {
  const { t } = useTranslation();
  const [rawPillars, setPillars] = useState(FALLBACK);
  const pillars = useDbTranslate(rawPillars);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api('/sigma').then((d) => {
      if (cancelled || !d?.pillars?.length) return;
      setPillars(d.pillars);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useReveal([pillars]);

  return (
    <div className="pt-28 pb-8 md:pt-32">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4">
        <div data-reveal className="max-w-3xl">
          <p className="eyebrow">{t('brand.party')}</p>
          <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">S.I.G.M.A.</h1>
          <p className="lead mt-4 text-xl">{t('sigma.lead')}</p>
          <div className="yellow-rule mt-6" aria-hidden="true" />
        </div>
      </div>

      {/* Five-letter architecture — interactive on desktop, stacked on mobile */}
      <section className="section-tight mt-6" aria-labelledby="sigma-arch">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="sigma-arch" data-reveal className="sr-only">{t('sigma.archTitle')}</h2>

          {/* Desktop: letter rail + detail panel */}
          <div data-reveal className="hidden lg:grid grid-cols-[auto_1fr] gap-10 items-stretch">
            <ol className="flex flex-col gap-3" role="tablist" aria-label={t('sigma.archTitle')}>
              {pillars.map((p, i) => {
                const Icon = PILLAR_ICONS[p.letter] || Eye;
                const selected = i === active;
                return (
                  <li key={p.letter}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActive(i)}
                      className={`group flex w-56 items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                        selected
                          ? 'border-yellow bg-gradient-to-r from-ink-900 to-ink-950 text-white shadow-card-hover -translate-y-0.5'
                          : 'border-ink-100/70 bg-white dark:border-ink-700/50 dark:bg-ink-900/60 hover:-translate-y-0.5 hover:shadow-card'
                      }`}
                    >
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-2xl font-black transition-colors ${
                        selected ? 'bg-yellow text-ink-950' : 'bg-ink-50 text-ink dark:bg-ink-800 dark:text-ink-100 group-hover:bg-ink group-hover:text-white dark:group-hover:bg-yellow dark:group-hover:text-ink-950'
                      }`}>
                        {p.letter}
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate font-display font-bold ${selected ? 'text-white' : 'text-ink dark:text-white'}`}>{p.name}</span>
                        <span className={`block text-xs ${selected ? 'text-ink-100/80' : 'text-ink-500 dark:text-ink-200/70'}`}>
                          {t('sigma.system')} {i + 1}
                        </span>
                      </span>
                      <Icon size={20} weight="bold" className={`ml-auto shrink-0 ${selected ? 'text-yellow-300' : 'text-ink-300 dark:text-ink-400'}`} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 p-8 xl:p-12" aria-live="polite">
              <div className="texture-grid absolute inset-0 opacity-40" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-yellow/15 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <span className="font-display text-8xl font-black text-yellow/90 xl:text-9xl" aria-hidden="true">{pillars[active]?.letter}</span>
                <h3 className="mt-4 font-display text-3xl font-bold text-white xl:text-4xl">{pillars[active]?.name}</h3>
                <div className="yellow-rule mt-4" aria-hidden="true" />
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-100/85">{pillars[active]?.description}</p>
                <p className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
                  <ArrowsDownUp size={14} weight="bold" aria-hidden="true" />
                  {t('sigma.flowHint', { next: pillars[(active + 1) % pillars.length]?.name })}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: stacked, expandable */}
          <div className="lg:hidden space-y-3">
            {pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[p.letter] || Eye;
              const isOpen = expanded === i;
              return (
                <div key={p.letter} data-reveal className={`card overflow-hidden ${isOpen ? 'border-yellow/60' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 p-4 text-left cursor-pointer"
                  >
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-2xl font-black ${isOpen ? 'bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950' : 'bg-ink-50 text-ink dark:bg-ink-800 dark:text-ink-100'}`}>
                      {p.letter}
                    </span>
                    <span className="font-display text-lg font-bold text-ink dark:text-white">{p.name}</span>
                    <CaretDown
                      size={18}
                      weight="bold"
                      className={`ml-auto shrink-0 text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-ink-100/60 px-4 pb-4 pt-3 dark:border-ink-700/50">
                      <p className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-100/85">
                        <Icon size={18} weight="bold" className="mt-0.5 shrink-0 text-yellow-500" aria-hidden="true" />
                        {p.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Five Historic Pillars */}
      <section className="section bg-white/60 dark:bg-ink-900/40 border-y border-ink-100/60 dark:border-ink-700/40" aria-labelledby="historic-title">
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal>
            <SectionTitle id="historic-title" eyebrow={t('sigma.historicEyebrow')} title={t('sigma.historicTitle')} lead={t('sigma.historicLead')} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {HISTORIC.map((h, i) => {
              const Icon = h.icon;
              return (
                <article key={h.key} data-reveal style={{ transitionDelay: `${i * 60}ms` }} className="card card-hover group relative overflow-hidden p-6">
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow to-red-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${h.tone}`}>
                    <Icon size={24} weight="bold" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink dark:text-white">{t(`historic.${h.key}.title`)}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">{t(`historic.${h.key}.tag`)}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-500 dark:text-ink-200/75">{t(`historic.${h.key}.text`)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Priority agenda */}
      <section className="section" aria-labelledby="agenda-title">
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal>
            <SectionTitle id="agenda-title" eyebrow={t('sigma.agendaEyebrow')} title={t('sigma.agendaTitle')} lead={t('sigma.agendaLead')} action={{ to: '/agenda', label: t('home.viewAll') }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENDA.map((a, i) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.key}
                  to="/agenda"
                  data-reveal
                  style={{ transitionDelay: `${i * 40}ms` }}
                  className="card card-hover group flex items-start gap-4 p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-white dark:bg-ink-800 dark:text-ink-100 dark:group-hover:bg-yellow dark:group-hover:text-ink-950">
                    <Icon size={21} weight="bold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold text-ink dark:text-white">{t(`agenda.${a.key}.title`)}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-500 dark:text-ink-200/75">{t(`agenda.${a.key}.text`)}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-300">
                      {t('sigma.explore')} →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
