import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';

export function SectionTitle({ eyebrow, title, lead, action, id }) {
  return (
    <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className="h-display mt-2 text-3xl md:text-4xl text-balance">{title}</h2>
        <div className="yellow-rule mt-4" aria-hidden="true" />
        {lead && <p className="lead mt-4">{lead}</p>}
      </div>
      {action && (
        <Link to={action.to} className="btn btn-outline btn-sm group">
          {action.label}
          <ArrowUpRight size={15} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function ReadMore({ to }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-yellow-600 dark:text-yellow-300">
      {t('home.readMore')}
      <ArrowRight size={14} weight="bold" aria-hidden="true" />
    </span>
  );
}

export default SectionTitle;
