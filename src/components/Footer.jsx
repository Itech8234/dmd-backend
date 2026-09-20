import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FacebookLogo, XLogo, InstagramLogo, YoutubeLogo, WhatsappLogo,
  MapPin, Phone, EnvelopeSimple, SealCheck,
} from '@phosphor-icons/react';
import { Logo, LangSwitcher } from './Header.jsx';

const SOCIALS = [
  { href: 'https://facebook.com/dmdyobe', icon: FacebookLogo, label: 'Facebook' },
  { href: 'https://x.com/dmdyobe', icon: XLogo, label: 'X (Twitter)' },
  { href: 'https://instagram.com/dmdyobe', icon: InstagramLogo, label: 'Instagram' },
  { href: 'https://youtube.com/@dmdyobe', icon: YoutubeLogo, label: 'YouTube' },
  { href: 'https://wa.me/2348000000000', icon: WhatsappLogo, label: 'WhatsApp' },
];

export default function Footer() {
  const { t } = useTranslation();
  const links = [
    { to: '/about', key: 'about' },
    { to: '/sigma', key: 'sigma' },
    { to: '/agenda', key: 'agenda' },
    { to: '/roadmap', key: 'roadmap' },
    { to: '/news', key: 'news' },
    { to: '/media', key: 'media' },
    { to: '/volunteer', key: 'volunteer' },
    { to: '/contact', key: 'contact' },
  ];
  return (
    <footer className="mt-8 bg-ink-950 text-ink-100">
      <div className="h-1 w-full bg-gradient-to-r from-ink-600 via-yellow to-red-600" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
                  <path d="M14 46 L32 14 L50 46" fill="none" stroke="#F5C518" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 46 L32 29 L42 46" fill="none" stroke="#D62828" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18 50 H46" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <div className="font-display text-lg font-black text-white">DMD</div>
                <div className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-yellow-300">{t('brand.party')}</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-200/80 max-w-xs">{t('footer.tagline')}</p>
            <div className="mt-4"><LangSwitcher /></div>
            <p className="mt-3 text-xs text-ink-200/60">{t('footer.langNote')}</p>
          </div>

          <nav aria-label={t('footer.quickLinks')}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-300">{t('footer.quickLinks')}</h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.key}>
                  <Link to={l.to} className="text-sm text-ink-200/80 hover:text-yellow-300 transition-colors duration-150">
                    {t(`nav.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-300">{t('contact.office')}</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-200/80">
              <li className="flex items-start gap-2.5"><MapPin size={18} weight="fill" className="text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" /> Damaturu, Yobe State, Nigeria</li>
              <li className="flex items-center gap-2.5"><Phone size={18} weight="fill" className="text-yellow-400 shrink-0" aria-hidden="true" /> +234 800 000 0000</li>
              <li className="flex items-center gap-2.5"><EnvelopeSimple size={18} weight="fill" className="text-yellow-400 shrink-0" aria-hidden="true" /> info@dmdyobe.ng</li>
              <li className="flex items-center gap-2.5"><SealCheck size={18} weight="fill" className="text-yellow-400 shrink-0" aria-hidden="true" /> {t('contact.hours')}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-300">{t('footer.connect')}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-yellow hover:text-ink-950 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Icon size={20} weight="bold" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-ink-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DMD Campaign. {t('footer.rights')}</p>
          <p>{t('footer.paidFor')}</p>
        </div>
      </div>
    </footer>
  );
}
