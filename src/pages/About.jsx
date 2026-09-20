import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap, Handshake, Lightbulb, Target, Scales, Medal, Quotes,
  MapPin, Users, Scroll, Sparkle, ShieldCheck, Monitor, ArrowsClockwise,
  Buildings,
} from '@phosphor-icons/react';
import SectionTitle from '../components/SectionTitle.jsx';
import { useReveal } from '../hooks/motion.js';
import api from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

const VALUES_ICONS = {
  integrity: Scales, service: Handshake, inclusion: Users,
  innovation: Lightbulb, excellence: Medal,
};

// The five campaign values (#18) — presented as premium cards.
const VALUES = ['integrity', 'service', 'inclusion', 'innovation', 'excellence'];

const QUICK_FACTS = [
  { icon: MapPin, key: 'origin' },
  { icon: GraduationCap, key: 'scholar' },
  { icon: Users, key: 'leader' },
  { icon: Scroll, key: 'hafiz' },
];

export default function About() {
  const { t, i18n } = useTranslation();
  const [rawCandidate, setCandidate] = useState(null);
  const [rawTimeline, setTimeline] = useState([]);
  const candidate = useDbTranslate(rawCandidate);
  const timeline = useDbTranslate(rawTimeline);
  const [openBio, setOpenBio] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api('/candidate').then((d) => {
      if (cancelled) return;
      setCandidate(d.candidate);
      setTimeline(d.timeline || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language]);

  useReveal([candidate, timeline]);

  const ha = i18n.language === 'ha';
  const pick = (field) => (ha && candidate?.[`${field}_ha`]) || candidate?.[field] || '';

  const education = timeline.filter((e) => e.kind === 'education');
  const leadership = timeline.filter((e) => e.kind === 'leadership');
  const community = timeline.filter((e) => e.kind === 'community');
  const originLines = candidate?.origin_lines?.length ? candidate.origin_lines : (pick('origin') ? pick('origin').split('\n').filter(Boolean) : []);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow">{t('brand.party')}</p>
        <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('about.title')}</h1>
        <p className="lead mt-4 text-xl">{t('about.lead')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </div>

      {/* Biography + portrait */}
      <section className="section-tight mt-4 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="bio-title">
        <div data-reveal className="card overflow-hidden rounded-3xl p-2 self-start lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 aspect-[4/5]">
            <img src={candidate?.portrait_url || '/dmd-photo.jpg'} alt={candidate?.full_name || t('brand.name')} className="h-full w-full object-cover" loading="lazy" decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/95 to-transparent p-5 pt-14">
              <p className="font-display text-lg font-bold text-white">{candidate?.full_name || t('brand.name')}</p>
              <p className="text-xs text-ink-100/80">{t('about.role')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-2 pt-3">
            {QUICK_FACTS.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key} className="flex items-center gap-2 rounded-xl bg-paper-soft p-2.5 dark:bg-ink-800/60">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950">
                    <Icon size={15} weight="bold" aria-hidden="true" />
                  </span>
                  <span className="text-[0.7rem] font-bold leading-tight text-ink-600 dark:text-ink-200/80">{t(`about.facts.${f.key}`)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 id="bio-title" data-reveal className="font-display text-2xl font-bold text-ink dark:text-white">{t('about.bioTitle')}</h2>
          <div data-reveal className={`mt-4 space-y-4 leading-relaxed text-ink-600 dark:text-ink-100/85 ${openBio ? '' : 'max-h-40 overflow-hidden [mask-image:linear-gradient(180deg,black_60%,transparent)]'}`}>
            {(pick('biography') || t('about.bioFallback')).split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <button
            type="button"
            onClick={() => setOpenBio((o) => !o)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-yellow-600 dark:text-yellow-300 hover:underline cursor-pointer"
            aria-expanded={openBio}
          >
            {openBio ? t('about.showLess') : t('about.readFullBio')} <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
          </button>

          {/* Origin */}
          {originLines.length > 0 && (
            <div data-reveal className="card mt-8 border-l-4 border-l-yellow p-6">
              <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink dark:text-white">
                <MapPin size={20} weight="bold" className="text-red-600 dark:text-red-400" aria-hidden="true" />
                {t('about.originTitle')}
              </h3>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-100/85">
                {originLines.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          )}

          <div data-reveal className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300"><Lightbulb size={20} weight="bold" aria-hidden="true" /></span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink dark:text-white">{t('about.visionTitle')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-200/80">{pick('vision') || t('about.visionFallback')}</p>
            </div>
            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red/20 dark:text-red-400"><Target size={20} weight="bold" aria-hidden="true" /></span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink dark:text-white">{t('about.missionTitle')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-200/80">{pick('mission') || t('about.missionFallback')}</p>
            </div>
          </div>

          {/* Values — five premium cards */}
          <h3 data-reveal className="mt-12 font-display text-2xl font-bold text-ink dark:text-white">{t('about.valuesTitle')}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => {
              const Icon = VALUES_ICONS[v] || Scales;
              return (
                <div data-reveal key={v} className="card card-hover group p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-950 text-yellow-300 transition-colors duration-300 group-hover:bg-yellow group-hover:text-ink-950 dark:bg-yellow dark:text-ink-950 dark:group-hover:bg-ink-950 dark:group-hover:text-yellow-300"><Icon size={19} weight="bold" aria-hidden="true" /></span>
                  <h4 className="mt-3 font-bold text-ink dark:text-white">{t(`about.values.${v}.title`)}</h4>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-200/80 leading-relaxed">{t(`about.values.${v}.text`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Educational Journey */}
      <section className="section" aria-labelledby="education-title">
        <div data-reveal>
          <SectionTitle id="education-title" eyebrow={t('about.eduEyebrow')} title={t('about.eduTitle')} lead={t('about.eduLead')} />
        </div>
        <ol className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-yellow before:via-ink-200 before:to-transparent md:before:left-1/2">
          {(education.length ? education : []).map((item, i) => (
            <li key={item.id} data-reveal className={`relative grid gap-3 pl-14 md:grid-cols-2 md:pl-0 ${i % 2 ? 'md:[direction:rtl]' : ''}`}>
              <span className="absolute left-3 top-2 z-10 grid h-4 w-4 place-items-center rounded-full bg-yellow ring-4 ring-paper dark:ring-ink-950 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
              <div className={`card p-5 md:[direction:ltr] ${i % 2 ? 'md:col-start-2' : 'md:col-start-1 md:justify-self-end'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  {item.year && <span className="badge badge-yellow">{item.year}</span>}
                  <span className="badge badge-green"><GraduationCap size={11} weight="fill" aria-hidden="true" /> {t('about.eduBadge')}</span>
                </div>
                <h3 className="mt-2 font-bold text-ink dark:text-white leading-snug">{(ha && item.title_ha) || item.title}</h3>
                {item.description && <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed">{item.description}</p>}
              </div>
            </li>
          ))}
          {!education.length && (
            <li data-reveal className="card p-5 text-sm text-ink-500 dark:text-ink-200/70">{t('about.eduEmpty')}</li>
          )}
        </ol>
      </section>

      {/* Leadership Experience */}
      <section className="section bg-white/60 dark:bg-ink-900/40 border-y border-ink-100/60 dark:border-ink-700/40" aria-labelledby="leadership-title">
        <div className="mx-auto max-w-7xl px-0">
          <div data-reveal>
            <SectionTitle id="leadership-title" eyebrow={t('about.leadEyebrow')} title={t('about.leadTitle')} lead={t('about.leadLead')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(leadership.length ? leadership : []).map((item, i) => (
              <div key={item.id} data-reveal style={{ transitionDelay: `${(i % 3) * 50}ms` }} className="card card-hover flex items-start gap-3.5 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950">
                  <Buildings size={18} weight="bold" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold leading-snug text-ink dark:text-white">{(ha && item.title_ha) || item.title}</h3>
                  {item.description && <p className="mt-1 text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed">{item.description}</p>}
                </div>
              </div>
            ))}
            {!leadership.length && candidate?.leadership_lines?.map((line, i) => (
              <div key={i} data-reveal className="card flex items-start gap-3.5 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950"><Buildings size={18} weight="bold" aria-hidden="true" /></span>
                <p className="font-bold leading-snug text-ink dark:text-white">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Philosophy */}
      <section data-reveal className="pb-4 pt-16" aria-label={t('about.philTitle')}>
        <figure className="card relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 p-8 md:p-12 text-center">
          <Quotes size={40} weight="fill" className="mx-auto text-yellow-400/60" aria-hidden="true" />
          <blockquote className="mx-auto mt-4 max-w-3xl font-display text-xl font-semibold leading-relaxed text-white md:text-2xl text-balance">
            {pick('philosophy') || t('about.quote')}
          </blockquote>
          <figcaption className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">
            — {candidate?.full_name || t('brand.name')}
          </figcaption>
        </figure>
      </section>

      <section className="section-tight" aria-labelledby="phil-detail-title">
        <div className="mx-auto max-w-7xl px-0">
          <h2 id="phil-detail-title" data-reveal className="sr-only">{t('about.philTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {['performance', 'accountability', 'service', 'innovation', 'development'].map((k, i) => (
              <div key={k} data-reveal style={{ transitionDelay: `${i * 50}ms` }} className="card card-hover p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300"><Sparkle size={19} weight="bold" aria-hidden="true" /></span>
                <h3 className="mt-3 font-bold text-ink dark:text-white">{t(`about.phil.${k}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-200/75">{t(`about.phil.${k}.text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-reveal className="pb-16" aria-label={t('about.ctaTitle')}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-8 text-center md:p-12">
          <div className="texture-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-2xl font-black text-white text-balance md:text-3xl">{t('about.ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-100/80">{t('about.ctaText')}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/sigma" className="btn btn-yellow">{t('hero.ctaPrimary')}</Link>
              <Link to="/volunteer" className="btn border border-white/30 text-white hover:bg-white/10">{t('volunteer.title')}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
