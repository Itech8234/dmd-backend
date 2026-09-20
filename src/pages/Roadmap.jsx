import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Flag } from '@phosphor-icons/react';
import { useReveal } from '../hooks/motion.js';
import api from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

// Fallback = roadmap content (seeded in Django, admin-editable there).
const FALLBACK = [
  { year: '2027', title: 'BUILD THE FOUNDATION', description: 'Lay the systems, structures and trust on which delivery is built.', milestones: ['State-wide financial audits', 'SDMU tracking', 'Security technology deployment', 'Drainage assessments', '24/7 Command Centre'] },
  { year: '2028', title: 'EXPAND DELIVERY', description: 'Scale the programmes that touch daily life in every LGA.', milestones: ['Initial 200MW renewable energy phase', 'Expanded water access', 'Ward-level primary healthcare upgrades'] },
  { year: '2029', title: 'ACCELERATE GROWTH', description: 'Turn foundations into economic momentum.', milestones: ['Agro-processing hubs', 'Digital economy expansion', 'E-learning rollout'] },
  { year: '2030/31', title: 'DELIVER PERFORMANCE', description: 'Consolidate measurable performance and regional leadership.', milestones: ['500MW power-grid operationalisation', 'Regional export leadership', 'Infrastructure resilience', 'Greater economic self-sufficiency'] },
];

export default function Roadmap() {
  const { t } = useTranslation();
  const [rawPhases, setPhases] = useState(FALLBACK);
  const phases = useDbTranslate(rawPhases);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api('/roadmap').then((d) => {
      if (cancelled || !d?.phases?.length) return;
      setPhases(d.phases);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useReveal([phases]);

  return (
    <div className="pt-28 pb-8 md:pt-32">
      <div className="mx-auto max-w-7xl px-4">
        <div data-reveal className="max-w-3xl">
          <p className="eyebrow">{t('brand.party')}</p>
          <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('roadmap.title')}</h1>
          <p className="lead mt-4 text-xl">{t('roadmap.lead')}</p>
          <div className="yellow-rule mt-6" aria-hidden="true" />
        </div>
      </div>

      <section className="section-tight" aria-label={t('roadmap.title')}>
        <ol className="relative mx-auto max-w-5xl px-4 space-y-6
            before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-yellow before:via-ink-200 before:to-transparent md:before:left-1/2 md:-before:translate-x-px">
          {phases.map((p, i) => {
            const isOpen = active === i;
            return (
              <li key={p.year} data-reveal className="relative pl-14 md:pl-0 md:grid md:grid-cols-2 md:gap-12">
                <span
                  className={`absolute left-3 top-5 z-10 grid h-6 w-6 place-items-center rounded-full md:left-1/2 md:-translate-x-1/2 transition-colors duration-300 ${isOpen ? 'bg-yellow ring-4 ring-yellow/30' : 'bg-ink-950 ring-4 ring-paper dark:ring-ink-950 dark:bg-yellow'}`}
                  aria-hidden="true"
                >
                  <Flag size={12} weight="fill" className={isOpen ? 'text-ink-950' : 'text-yellow-300 dark:text-ink-950'} />
                </span>

                <div className={`card card-hover overflow-hidden ${i % 2 ? 'md:col-start-2' : 'md:col-start-1 md:justify-self-end'} w-full`}>
                  <button
                    type="button"
                    onClick={() => setActive(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 p-5 text-left cursor-pointer"
                  >
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-lg font-black leading-none ${isOpen ? 'bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950' : 'bg-gradient-to-br from-yellow-400 to-red-500 text-ink-950'}`}>
                      {p.year}
                    </span>
                    <span className="min-w-0 grow">
                      <span className="block font-display text-lg font-bold leading-snug text-ink dark:text-white">{p.title}</span>
                      <span className="mt-0.5 block text-xs font-semibold text-ink-400 dark:text-ink-200/60">
                        {t('roadmap.phase')} {i + 1} / {phases.length}
                      </span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-ink-100/60 px-5 pb-5 pt-4 dark:border-ink-700/50">
                      {p.description && <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-200/75">{p.description}</p>}
                      <ul className="mt-4 space-y-2.5">
                        {(p.milestones || []).map((m, mi) => (
                          <li key={mi} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-100/85">
                            <CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-yellow-500" aria-hidden="true" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
