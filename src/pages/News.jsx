import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowUpRight, Newspaper, Microphone } from '@phosphor-icons/react';
import SectionTitle from '../components/SectionTitle.jsx';
import Cover from '../components/Cover.jsx';
import { useReveal } from '../hooks/motion.js';
import api, { fmtDate } from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

export function NewsList() {
  const { t, i18n } = useTranslation();
  const [rawNews, setNews] = useState([]);
  const news = useDbTranslate(rawNews);

  useEffect(() => {
    let cancelled = false;
    api('/news').then((d) => { if (!cancelled) setNews(d.items); }).catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language]);

  useReveal([news]);

  const ha = i18n.language === 'ha';
  const pick = (obj, field) => (obj && ((ha && obj[`${field}_ha`]) || obj[field])) || '';
  const speeches = news.filter((n) => n.kind === 'speech');
  const articles = news.filter((n) => n.kind !== 'speech');
  const [featured, ...rest] = articles;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow">{t('brand.party')}</p>
        <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('news.title')}</h1>
        <p className="lead mt-4 text-xl">{t('news.lead')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </div>

      {featured && (
        <Link to={`/news/${featured.slug}`} data-reveal className="card card-hover group mt-10 grid overflow-hidden md:grid-cols-2 rounded-3xl">
          <Cover src={featured.cover_url} className="min-h-56 h-full" alt="" icon={<Newspaper size={40} weight="bold" aria-hidden="true" />} iconWrapClass="text-white/40" />
          <div className="p-7 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="badge badge-yellow">Featured</span>
              <span className="badge badge-line">{featured.category_name}</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors md:text-3xl">
              {pick(featured, 'title')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-200/75 line-clamp-3">{pick(featured, 'summary')}</p>
            <p className="mt-4 text-xs font-semibold text-ink-400 dark:text-ink-200/60">
              <time dateTime={featured.published_at}>{fmtDate(featured.published_at, i18n.language)}</time>
            </p>
          </div>
        </Link>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((n) => (
          <Link to={`/news/${n.slug}`} key={n.id} data-reveal className="card card-hover group overflow-hidden p-0 flex flex-col">
            <Cover src={n.cover_url} className="h-40 w-full" alt="" icon={<Newspaper size={32} weight="bold" aria-hidden="true" />} />
            <div className="flex grow flex-col p-6 pt-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="badge badge-line">{n.category_name}</span>
                <time dateTime={n.published_at} className="text-ink-400 dark:text-ink-200/60 font-semibold">{fmtDate(n.published_at, i18n.language)}</time>
              </div>
              <h2 className="mt-3 font-display text-lg font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">
                {pick(n, 'title')}
              </h2>
              <p className="mt-2 grow text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed line-clamp-3">{pick(n, 'summary')}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                {t('home.readMore')} <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {speeches.length > 0 && (
        <section className="mt-16" aria-labelledby="speeches-title">
          <SectionTitle id="speeches-title" title={t('news.speeches')} />
          <div className="grid gap-5 md:grid-cols-2">
            {speeches.map((s) => (
              <Link to={`/news/${s.slug}`} key={s.id} data-reveal className="card card-hover flex items-start gap-4 p-6 group">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950"><Microphone size={22} weight="bold" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h3 className="font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">{pick(s, 'title')}</h3>
                  <p className="mt-1 text-xs font-semibold text-ink-400 dark:text-ink-200/60">{fmtDate(s.published_at, i18n.language)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function NewsDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [rawArticle, setArticle] = useState(null);
  const [rawRelated, setRelated] = useState([]);
  const article = useDbTranslate(rawArticle);
  const related = useDbTranslate(rawRelated);

  useEffect(() => {
    let cancelled = false;
    api(`/news/${slug}`).then((d) => {
      if (cancelled) return;
      setArticle(d.article);
      setRelated(d.related || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [slug, i18n.language]);

  useReveal([article]);

  if (!article) return <div className="pt-32 text-center text-ink-500">{t('common.loading')}</div>;

  const ha = i18n.language === 'ha';
  const pick = (field) => (article ? (ha && article[`${field}_ha`]) || article[field] || '' : '');

  return (
    <article className="mx-auto max-w-3xl px-4 pt-28 pb-8 md:pt-32">
      <Link to="/news" className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 dark:text-ink-200 hover:text-ink dark:hover:text-white transition-colors" data-reveal>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" /> {t('news.title')}
      </Link>

      <header data-reveal className="mt-6">
        <span className="badge badge-green">{article.category_name}</span>
        <h1 className="h-display mt-3 text-3xl md:text-5xl text-balance">{pick('title')}</h1>
        <p className="mt-3 text-sm font-semibold text-ink-400 dark:text-ink-200/60">
          <time dateTime={article.published_at}>{fmtDate(article.published_at, i18n.language)}</time>
        </p>
        <div className="yellow-rule mt-5" aria-hidden="true" />
      </header>

      {article.cover_url && (
        <figure data-reveal className="mt-7 overflow-hidden rounded-2xl">
          <img src={article.cover_url} alt="" className="w-full object-cover max-h-96" loading="lazy" />
        </figure>
      )}

      <div data-reveal className="mt-8 leading-relaxed text-ink-600 dark:text-ink-100/85 text-[1.05rem]">
        {pick('body').split('\n').filter(Boolean).map((para, i) => <p key={i} className="mb-4">{para}</p>)}
      </div>

      {related.length > 0 && (
        <section data-reveal className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="font-display text-xl font-bold text-ink dark:text-white mb-4">{t('news.relatedTitle')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} to={`/news/${r.slug}`} className="card card-hover p-4 group">
                <p className="text-sm font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">
                  {(ha && r.title_ha) || r.title}
                </p>
                <p className="mt-1 text-xs text-ink-400 dark:text-ink-200/60">{fmtDate(r.published_at, i18n.language)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
