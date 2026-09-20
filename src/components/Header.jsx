import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  House, UserFocus, Sigma, Scroll, Newspaper, PlayCircle,
  HandHeart, Envelope, List, X, Moon, Sun, SignIn, SignOut, ShieldCheck, MapTrifold,
} from '@phosphor-icons/react';
import { useAuth } from '../hooks/auth.jsx';
import { setLang, LANGS, onTranslatingChange, isTranslating } from '../i18n/index.js';

const ICONS = {
  home: House, about: UserFocus, sigma: Sigma, agenda: Scroll, roadmap: MapTrifold,
  news: Newspaper, media: PlayCircle, volunteer: HandHeart, contact: Envelope,
};

export function Logo({ compact = false }) {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label={t('brand.name')}>
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 shadow-card group-hover:shadow-yellow transition-shadow duration-300">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <path d="M14 46 L32 14 L50 46" fill="none" stroke="#F5C518" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 46 L32 29 L42 46" fill="none" stroke="#D62828" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 50 H46" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-black text-ink dark:text-white">DMD</span>
        {!compact && <span className="block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-200/80">{t('brand.party')}</span>}
      </span>
    </Link>
  );
}

export function LangSwitcher() {
  const { i18n, t } = useTranslation();
  const [busy, setBusy] = useState(isTranslating());
  useEffect(() => onTranslatingChange((v) => setBusy(v)) && undefined, []);
  const handle = async (code) => {
    try { await setLang(code); } catch (e) { /* keep English on failure */ }
  };
  return (
    <div role="group" aria-label={t('common.langLabel')} className="flex items-center rounded-lg border border-ink-100 dark:border-ink-700/60 overflow-hidden text-xs font-bold">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => handle(l.code)}
          disabled={busy}
          aria-pressed={i18n.language === l.code}
          title={l.full}
          className={`min-h-8 px-2.5 py-1 cursor-pointer transition-colors duration-150 disabled:opacity-60 ${
            i18n.language === l.code ? 'bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950' : 'text-ink-500 dark:text-ink-200 hover:bg-ink/10'
          }`}
        >
          {busy && l.code === 'ha' ? '…' : l.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('dmd-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }, [dark]);
  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink/10 hover:text-ink dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white transition-colors duration-150 cursor-pointer"
    >
      {dark ? <Sun size={18} weight="bold" aria-hidden="true" /> : <Moon size={18} weight="bold" aria-hidden="true" />}
    </button>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const { user, isStaff, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // ESC closes the menu; body scroll locked while open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = [
    { to: '/', key: 'home', icon: ICONS.home, end: true },
    { to: '/about', key: 'about', icon: ICONS.about },
    { to: '/sigma', key: 'sigma', icon: ICONS.sigma },
    { to: '/agenda', key: 'agenda', icon: ICONS.agenda },
    { to: '/roadmap', key: 'roadmap', icon: ICONS.roadmap },
    { to: '/news', key: 'news', icon: ICONS.news },
    { to: '/media', key: 'media', icon: ICONS.media },
    { to: '/volunteer', key: 'volunteer', icon: ICONS.volunteer },
    { to: '/contact', key: 'contact', icon: ICONS.contact },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-40 border-b transition-all duration-300 ${scrolled || open ? 'glass border-ink-100/70 dark:border-ink-700/50 shadow-card' : 'border-transparent bg-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:btn focus:btn-primary focus:btn-sm">{t('common.skipToContent')}</a>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Logo />

          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Primary">
            {links.map((l) => (
              <NavLink key={l.key} to={l.to} end={l.end} className="nav-link">
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
          </nav>
          <nav className="hidden lg:flex xl:hidden items-center gap-0.5" aria-label="Primary">
            {links.filter((l) => !['media', 'contact', 'roadmap'].includes(l.key)).map((l) => (
              <NavLink key={l.key} to={l.to} end={l.end} className="nav-link">
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:block"><LangSwitcher /></div>
            <ThemeToggle />
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isStaff && (
                  <Link to="/admin" className="btn btn-outline btn-sm gap-1.5">
                    <ShieldCheck size={15} weight="bold" aria-hidden="true" /> {t('nav.admin')}
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-primary btn-sm">{t('nav.dashboard')}</Link>
                <button type="button" onClick={logout} className="btn btn-ghost btn-sm" aria-label={t('volunteer.logout')}>
                  <SignOut size={15} weight="bold" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-1.5 btn btn-primary btn-sm">
                <SignIn size={15} weight="bold" aria-hidden="true" /> {t('nav.signIn')}
              </Link>
            )}
            <button
              ref={toggleRef}
              type="button"
              className="lg:hidden grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink/10 dark:text-ink-200 dark:hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={20} weight="bold" aria-hidden="true" /> : <List size={20} weight="bold" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" ref={menuRef} className="lg:hidden pb-4 flex flex-col gap-1 glass rounded-b-2xl border-t border-ink-100/60 dark:border-ink-700/50 px-2 pt-2 max-h-[calc(100dvh-4rem)] overflow-y-auto" aria-label="Mobile">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.key}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-ink/8 text-ink dark:bg-white/15 dark:text-white' : 'text-ink-700 dark:text-ink-100 hover:bg-ink/8 dark:hover:bg-white/10'}`}
                >
                  <Icon size={18} weight="bold" aria-hidden="true" /> {t(`nav.${l.key}`)}
                </NavLink>
              );
            })}
            <div className="mt-1 flex gap-2 border-t border-ink-100/60 dark:border-ink-700/50 pt-3">
              {user ? (
                <>
                  {isStaff && <Link to="/admin" className="btn btn-outline btn-sm grow"><ShieldCheck size={15} weight="bold" aria-hidden="true" /> {t('nav.admin')}</Link>}
                  <Link to="/dashboard" className="btn btn-primary btn-sm grow">{t('nav.dashboard')}</Link>
                  <button type="button" onClick={logout} className="btn btn-outline btn-sm grow">{t('volunteer.logout')}</button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm grow"><SignIn size={15} weight="bold" aria-hidden="true" /> {t('nav.signIn')}</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
