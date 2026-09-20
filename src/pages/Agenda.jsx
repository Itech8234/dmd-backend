import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Flag, Scroll } from '@phosphor-icons/react';
import SectionTitle from '../components/SectionTitle.jsx';
import Cover from '../components/Cover.jsx';
import { useReveal } from '../hooks/motion.js';
import api from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

export function AgendaList() {
  const { t, i18n } = useTranslation();
  const [rawPolicies, setPolicies] = useState([]);
  const [rawCategories, setCategories] = useState([]);
  const policies = useDbTranslate(rawPolicies);
  const categories = useDbTranslate(rawCategories);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    api('/policies').then((d) => {
      if (cancelled) return;
      setPolicies(d.items);
      setCategories([{ slug: 'all', name: t('agenda.filterAll') }, ...d.categories.map((c) => ({ slug: c.slug, name: c.name }))]);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language, t]);

  useReveal([policies, filter]);

  const ha = i18n.language === 'ha';
  const pick = (obj, field) => (obj && ((ha && obj[`${field}_ha`]) || obj[field])) || '';
  const visible = filter === 'all' ? policies : policies.filter((p) => p.category_slug === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow">{t('brand.party')}</p>
        <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('agenda.title')}</h1>
        <p className="lead mt-4 text-xl">{t('agenda.lead')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </div>

      <div data-reveal className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter policies">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setFilter(c.slug)}
            aria-pressed={filter === c.slug}
            className={`btn btn-sm ${filter === c.slug ? 'btn-primary' : 'btn-outline'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <Link to={`/agenda/${p.slug}`} key={p.id} data-reveal className="card card-hover group overflow-hidden p-0 flex flex-col">
            <Cover
              src={p.cover_url}
              className="h-40 w-full"
              alt=""
              icon={<Scroll size={36} weight="bold" aria-hidden="true" />}
            />
            <div className="flex grow flex-col p-6 pt-5">
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-green">{pick(p.category, 'name') || p.category_name}</span>
                {p.priority === 'flagship' && (
                  <span className="badge badge-red"><Flag size={11} weight="fill" aria-hidden="true" /> {t('agenda.progressLabel')}: flagship</span>
                )}
              </div>
              <h2 className="mt-3 font-display text-xl font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">
                {pick(p, 'title')}
              </h2>
              <p className="mt-2 grow text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed">{pick(p, 'summary')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AgendaDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [rawPolicy, setPolicy] = useState(null);
  const [error, setError] = useState(null);
  const policy = useDbTranslate(rawPolicy);

  useEffect(() => {
    let cancelled = false;
    api(`/policies/${slug}`).then((d) => { if (!cancelled) setPolicy(d.policy); }).catch((e) => setError(e));
    return () => { cancelled = true; };
  }, [slug, i18n.language]);

  useReveal([policy]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-32 text-center">
        <h1 className="h-display text-3xl">{t('common.notFoundTitle')}</h1>
        <Link to="/agenda" className="btn btn-primary mt-6">{t('common.backHome')}</Link>
      </div>
    );
  }
  if (!policy) return <div className="pt-32 text-center text-ink-500">{t('common.loading')}</div>;

  const ha = i18n.language === 'ha';
  const pick = (field) => (policy ? (ha && policy[`${field}_ha`]) || policy[field] || '' : '');
  const targets = (ha && policy.targets_ha ? policy.targets_ha : policy.targets) || [];

  return (
    <article className="mx-auto max-w-3xl px-4 pt-28 pb-8 md:pt-32">
      <Link to="/agenda" data-reveal className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 dark:text-ink-200 hover:text-ink dark:hover:text-white transition-colors">
        <ArrowLeft size={15} weight="bold" aria-hidden="true" /> {t('nav.agenda')}
      </Link>
      <header data-reveal className="mt-6">
        <span className="badge badge-green">{policy.category_name}</span>
        <h1 className="h-display mt-3 text-3xl md:text-5xl text-balance">{pick('title')}</h1>
        <p className="lead mt-4">{pick('summary')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </header>

      {policy.cover_url && (
        <figure data-reveal className="mt-7 overflow-hidden rounded-2xl">
          <Cover src={policy.cover_url} alt="" className="w-full max-h-80 md:aspect-[3/1]" icon={<Scroll size={48} weight="bold" aria-hidden="true" />} />
        </figure>
      )}

      <div data-reveal className="prose prose-lg mt-8 max-w-none text-ink-600 dark:text-ink-100/85 leading-relaxed">
        {pick('body').split('\n').filter(Boolean).map((para, i) => <p key={i} className="mb-4">{para}</p>)}
      </div>

      {targets.length > 0 && (
        <section data-reveal className="card mt-8 p-6 md:p-8" aria-labelledby="targets-title">
          <h2 id="targets-title" className="font-display text-xl font-bold text-ink dark:text-white">{t('agenda.targetsLabel')}</h2>
          <ul className="mt-4 space-y-3">
            {targets.map((target, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-ink-600 dark:text-ink-100/85">
                <CheckCircle size={19} weight="fill" className="shrink-0 mt-0.5 text-yellow-500" aria-hidden="true" />
                {target}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
