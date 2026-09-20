import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from '@phosphor-icons/react';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-xl px-4 pt-36 pb-24 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300">
        <Compass size={40} weight="bold" aria-hidden="true" />
      </span>
      <p className="mt-6 font-display text-7xl font-black text-ink/10 dark:text-white/10" aria-hidden="true">404</p>
      <h1 className="h-display -mt-6 text-3xl">{t('common.notFoundTitle')}</h1>
      <p className="lead mt-3">{t('common.notFoundText')}</p>
      <Link to="/" className="btn btn-primary mt-8">{t('common.backHome')}</Link>
    </div>
  );
}
