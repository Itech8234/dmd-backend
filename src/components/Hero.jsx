import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart, Users, MapPin, Scroll, Sparkle } from '@phosphor-icons/react';

const STAT_TONES = {
  green: 'bg-ink-100 text-ink-700 dark:bg-ink-500/25 dark:text-ink-200',
  red:   'bg-red-100 text-red-600 dark:bg-red/20 dark:text-red-400',
  yellow:'bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300',
};

function StatCard({ icon: Icon, value, label, tone = 'yellow' }) {
  return (
    <div data-reveal className="card card-hover flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${STAT_TONES[tone]}`}>
        <Icon size={24} weight="bold" aria-hidden="true" />
      </span>
      <div>
        <div className="font-display text-2xl font-black text-ink dark:text-white leading-none">{value}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-200/70">{label}</div>
      </div>
    </div>
  );
}

export default function Hero({ candidate }) {
  const { t } = useTranslation();
  const portraitSrc = candidate?.portrait_url || candidate?.portrait || '/dmd-photo.jpg';

  return (
    <section className="relative overflow-hidden hero-grad" aria-labelledby="hero-title">
      <div className="texture-grid absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-yellow/15 blur-3xl animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute top-40 -left-32 h-80 w-80 rounded-full bg-ink-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute top-10 left-1/3 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Sparkle size={14} weight="fill" aria-hidden="true" />
              {t('hero.eyebrow')}
            </p>
            <h1 id="hero-title" className="h-display mt-4 text-4xl leading-[1.06] text-balance sm:text-5xl md:text-6xl xl:text-7xl">
              {t('hero.title1')}
              <span className="block text-ink-600 dark:text-ink-300 md:text-5xl xl:text-6xl">{t('hero.title2')}</span>
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-lg font-semibold text-yellow-600 dark:text-yellow-300 md:text-xl">
              <span>{t('hero.period')}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" aria-hidden="true" />
              <span>{t('brand.party')}</span>
            </p>
            <p className="lead mt-6 max-w-xl">{t('hero.lead')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sigma" className="btn btn-yellow group">
                {t('hero.ctaPrimary')}
                <ArrowRight size={17} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/about" className="btn btn-outline">{t('hero.ctaSecondary')}</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-yellow/30 via-transparent to-ink/10 blur-xl" aria-hidden="true" />
            <div className="card relative overflow-hidden rounded-[1.75rem] p-2">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-ink-800 to-ink-950 aspect-[4/5]">
                <img src={portraitSrc} alt={`${candidate?.full_name || t('brand.name')} — portrait`} className="h-full w-full object-cover" fetchPriority="high" decoding="async"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-5 pt-16">
                  <p className="font-display text-xl font-bold text-white">{candidate?.full_name || t('brand.name')}</p>
                  <p className="text-sm text-ink-100/90">{candidate?.title || t('about.candidateLabel')}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 sm:-left-8 card px-4 py-3 shadow-card-hover">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950">
                  <HandHeart size={18} weight="bold" aria-hidden="true" />
                </span>
                <div className="text-xs">
                  <div className="font-bold text-ink dark:text-white">YPP</div>
                  <div className="text-ink-500 dark:text-ink-200/70">{t('brand.party').split('—')[0].trim()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} value="12,400+" label={t('hero.statVolunteers')} tone="green" />
          <StatCard icon={MapPin} value="17 / 17" label={t('hero.statLgas')} tone="red" />
          <StatCard icon={Scroll} value="6" label={t('hero.statPolicies')} tone="yellow" />
        </div>
      </div>
    </section>
  );
}
