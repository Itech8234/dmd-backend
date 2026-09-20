import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye, Lightbulb, ChartLine, Heartbeat, Plant,
  ArrowUpRight, ArrowRight, MapPin, Users, CalendarDots, Megaphone,
  Shield, Monitor,
} from '@phosphor-icons/react';
import Hero from '../components/Hero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import Cover from '../components/Cover.jsx';
import { useReveal } from '../hooks/motion.js';
import api, { fmtDate } from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

// S.I.G.M.A. preview letters (full architecture lives on /sigma, served by Django)
const SIGMA = [
  { letter: 'S', name: 'Supervision', icon: Eye, text: 'Supervision — real-time tracking and accountability.' },
  { letter: 'I', name: 'Innovation', icon: Lightbulb, text: 'Innovation — digital government, less bureaucracy.' },
  { letter: 'G', name: 'Growth', icon: ChartLine, text: 'Growth — education, enterprise and industry.' },
  { letter: 'M', name: 'Medicine', icon: Heartbeat, text: 'Medicine — quality healthcare for every citizen.' },
  { letter: 'A', name: 'Agriculture', icon: Plant, text: 'Agriculture — technology-driven commercial farming.' },
];

const GOVERNANCE = [
  { icon: Shield, key: 'naira' },
  { icon: Monitor, key: 'digital' },
  { icon: ChartLine, key: 'sdmu' },
  { icon: ChartLine, key: 'annual' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [rawData, setData] = useState({ candidate: null, policies: [], events: [], news: [] });
  const data = useDbTranslate(rawData);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api('/candidate'), api('/policies?limit=6'), api('/events?limit=3'), api('/news?limit=3')])
      .then(([candidate, policies, events, news]) => {
        if (!cancelled) setData({ candidate: candidate.candidate, policies: policies.items, events: events.items, news: news.items });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language]);

  useReveal([data]);

  const pick = (obj, field) => obj?.[`${field}_${i18n.language}`] || obj?.[field] || '';

  return (
    <>
      <Hero candidate={data.candidate} />

      {/* S.I.G.M.A. — the transformation architecture */}
      <section className="section" aria-labelledby="sigma-title">
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal>
            <SectionTitle
              id="sigma-title"
              eyebrow={t('sigma.eyebrow')}
              title={t('sigma.title')}
              lead={t('sigma.homeLead')}
              action={{ to: '/sigma', label: t('hero.ctaPrimary') }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SIGMA.map((s, i) => {
              const Icon = s.icon;
              return (
                <Link
                  to="/sigma"
                  key={s.letter}
                  data-reveal
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className="card card-hover group relative overflow-hidden p-6"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow to-red-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 font-display text-xl font-black text-yellow-300 transition-colors duration-300 group-hover:bg-yellow group-hover:text-ink-950 dark:bg-yellow dark:text-ink-950 dark:group-hover:bg-ink-950 dark:group-hover:text-yellow-300">
                      {s.letter}
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink dark:text-white">{t(`pillars.pillars.${s.letter.toLowerCase()}.title`)}</h3>
                  </div>
                  <p className="mt-3 text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed">{t(`pillars.pillars.${s.letter.toLowerCase()}.text`)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Governance & accountability */}
      <section className="section bg-ink-950 text-white relative overflow-hidden" aria-labelledby="gov-title">
        <div className="texture-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-yellow/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div data-reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">{t('gov.eyebrow')}</p>
            <h2 id="gov-title" className="mt-2 font-display text-3xl font-black text-balance md:text-4xl">{t('gov.title')}</h2>
            <p className="mt-4 text-ink-100/80 leading-relaxed">{t('gov.lead')}</p>
            <div className="yellow-rule mt-6" aria-hidden="true" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GOVERNANCE.map((g, i) => {
              const Icon = g.icon;
              return (
                <div key={g.key} data-reveal style={{ transitionDelay: `${i * 60}ms` }} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-yellow/50 hover:-translate-y-1">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow text-ink-950">
                    <Icon size={21} weight="bold" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">{t(`gov.${g.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-100/75">{t(`gov.${g.key}.text`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Agenda preview */}
      <section className="section bg-white/60 dark:bg-ink-900/40 border-y border-ink-100/60 dark:border-ink-700/40" aria-labelledby="agenda-preview">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle
            id="agenda-preview"
            eyebrow="Policy"
            title={t('home.agendaTitle')}
            lead={t('home.agendaLead')}
            action={{ to: '/agenda', label: t('home.viewAll') }}
          />
          <div className="grid gap-5 md:grid-cols-3">
            {data.policies.map((p) => (
              <Link to={`/agenda/${p.slug}`} key={p.id} data-reveal className="card card-hover group overflow-hidden p-0 flex flex-col">
                <Cover src={p.cover_url} className="h-36 w-full" alt="" icon={<ArrowUpRight size={30} weight="bold" aria-hidden="true" />} />
                <div className="flex grow flex-col p-6 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-green">{pick(p.category, 'name') || 'Policy'}</span>
                    {p.priority === 'flagship' && <span className="badge badge-red">★</span>}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors duration-200">
                    {pick(p, 'title')}
                  </h3>
                  <p className="mt-2 grow text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed">{pick(p, 'summary').slice(0, 140)}…</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                    {t('home.readMore')} <ArrowUpRight size={14} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Events + News */}
      <section className="section" aria-label="Events and news">
        <div className="mx-auto max-w-7xl px-4 grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle title={t('home.eventsTitle')} lead={t('home.eventsLead')} action={{ to: '/events', label: t('home.viewAll') }} />
            <div className="space-y-4">
              {data.events.map((ev) => (
                <Link to={`/events/${ev.id}`} key={ev.id} data-reveal className="card card-hover flex items-center gap-4 p-5 group">
                  <Cover src={ev.image_url} className="h-14 w-16 shrink-0 rounded-xl" alt="" icon={<CalendarDots size={20} weight="bold" aria-hidden="true" />} />
                  <div className="min-w-0 grow">
                    <h3 className="font-bold text-ink dark:text-white leading-snug truncate group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">{pick(ev, 'title')}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 dark:text-ink-200/70">
                      <span className="inline-flex items-center gap-1"><MapPin size={13} weight="fill" aria-hidden="true" /> {ev.venue}</span>
                      <span className="inline-flex items-center gap-1"><Users size={13} weight="fill" aria-hidden="true" /> {ev.attendee_count || 0}</span>
                    </p>
                  </div>
                  <ArrowRight size={22} weight="bold" className="shrink-0 text-ink-300 dark:text-ink-400" aria-hidden="true" />
                </Link>
              ))}
              {!data.events.length && <p className="text-sm text-ink-500 dark:text-ink-200/70">{t('events.upcomingEmpty')}</p>}
            </div>
          </div>

          <div>
            <SectionTitle title={t('home.newsTitle')} action={{ to: '/news', label: t('home.viewAll') }} />
            <div className="space-y-4">
              {data.news.map((n) => (
                <Link to={`/news/${n.slug}`} key={n.id} data-reveal className="card card-hover flex gap-4 p-5 group">
                  <Cover src={n.cover_url} className="h-16 w-20 shrink-0 self-start rounded-xl" alt="" icon={<Megaphone size={22} weight="bold" aria-hidden="true" />} />
                  <div className="min-w-0 grow">
                    <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-200/70">
                      <span className="badge badge-line">{n.category_name || 'Update'}</span>
                      <time dateTime={n.published_at}>{fmtDate(n.published_at, i18n.language)}</time>
                    </div>
                    <h3 className="mt-2 font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">{pick(n, 'title')}</h3>
                    <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-200/75 line-clamp-2">{pick(n, 'summary')}</p>
                  </div>
                </Link>
              ))}
              {!data.news.length && <p className="text-sm text-ink-500 dark:text-ink-200/70">—</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Our Pledge */}
      <section className="section-tight" aria-labelledby="pledge-title">
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal className="relative overflow-hidden rounded-3xl border border-ink-100/70 dark:border-ink-700/50 bg-gradient-to-br from-paper to-white dark:from-ink-900 dark:to-ink-950 p-8 text-center md:p-14">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ink-600 via-yellow to-red-600" aria-hidden="true" />
            <p className="eyebrow">{t('pledge.eyebrow')}</p>
            <h2 id="pledge-title" className="h-display mt-3 text-3xl font-black text-balance md:text-4xl">{t('pledge.title')}</h2>
            <div className="mx-auto mt-6 max-w-2xl space-y-4">
              <p className="font-display text-xl font-semibold leading-relaxed text-ink dark:text-white md:text-2xl">“{t('pledge.line1')}”</p>
              <p className="text-ink-600 dark:text-ink-100/80 leading-relaxed">{t('pledge.line2')}</p>
            </div>
            <p className="mt-8 font-display text-2xl font-black text-yellow-600 dark:text-yellow-300">{t('pledge.slogan')}</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-200/70">— {t('pledge.signer')}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/sigma" className="btn btn-primary group">
                {t('hero.ctaPrimary')}
                <ArrowRight size={16} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/roadmap" className="btn btn-outline">{t('roadmap.title')}</Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
