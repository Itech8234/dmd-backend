import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HandHeart, Users, CalendarDots, ChatCircleText, SignIn,
  Handshake, Megaphone, Chats, BookOpen,
} from '@phosphor-icons/react';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../hooks/auth.jsx';
import { useReveal } from '../hooks/motion.js';
import api from '../lib/api.js';
import Cover from '../components/Cover.jsx';

const ROLES = ['grassroots', 'digital', 'events', 'policy', 'other'];
const ROLE_ICONS = { grassroots: Users, digital: Megaphone, events: CalendarDots, policy: BookOpen, other: Chats };

export function VolunteerJoin() {
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const LGAS = ['Damaturu', 'Potiskum', 'Gashua', 'Nguru', 'Geidam', 'Maiduguri Road (Jere)', 'Bursari', 'Fika', 'Fune', 'Gujba', 'Gulani', 'Tarmuwa', 'Yunusari', 'Yusufari', 'Karasuwa', 'Kukawa', 'Machina', 'Nangere', 'Nganzai'];

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    setBusy(true);
    try {
      await api('/volunteers', {
        method: 'POST',
        body: {
          name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
          lga: fd.get('lga'), role: fd.get('role'), message: fd.get('message'),
        },
      });
      setDone(true);
      toast(t('volunteer.success'), 'success');
      e.target.reset();
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div data-reveal>
            <p className="eyebrow">{t('brand.party')}</p>
            <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('volunteer.title')}</h1>
            <p className="lead mt-4 text-xl">{t('volunteer.lead')}</p>
            <div className="yellow-rule mt-6" aria-hidden="true" />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ROLES.filter((r) => r !== 'other').map((r) => {
              const Icon = ROLE_ICONS[r];
              return (
                <div data-reveal key={r} className="card card-hover p-5 flex items-start gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300">
                    <Icon size={21} weight="bold" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-bold text-ink dark:text-white">{t(`volunteer.roles.${r}`)}</h2>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed">{t(`volunteer.roleText.${r}`)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div data-reveal className="card mt-6 flex items-start gap-3.5 bg-gradient-to-br from-ink-900 to-ink-950 p-6 text-white">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow text-ink-950"><Handshake size={21} weight="bold" aria-hidden="true" /></span>
            <div>
              <h2 className="font-display text-lg font-bold">{t('volunteer.perksTitle')}</h2>
              <p className="mt-1.5 text-sm text-ink-100/80 leading-relaxed">{t('volunteer.perksText')}</p>
            </div>
          </div>
        </div>

        <div data-reveal className="card self-start rounded-3xl p-7 md:p-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950"><HandHeart size={22} weight="bold" aria-hidden="true" /></span>
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">{t('volunteer.formTitle')}</h2>
          </div>

          {done ? (
            <div className="mt-8 text-center" role="status">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <HandHeart size={32} weight="bold" aria-hidden="true" />
              </span>
              <p className="mt-4 font-semibold text-ink dark:text-white">{t('volunteer.success')}</p>
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/volunteer/login" className="btn btn-primary">{t('volunteer.loginTitle')}</Link>
                <button type="button" onClick={() => setDone(false)} className="btn btn-ghost">{t('volunteer.createBtn')} — {t('volunteer.submit')}</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="v-name" className="field-label">{t('volunteer.name')} *</label>
                <input id="v-name" name="name" required minLength={3} className="field" autoComplete="name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="v-email" className="field-label">{t('volunteer.email')} *</label>
                  <input id="v-email" name="email" type="email" required className="field" autoComplete="email" />
                </div>
                <div>
                  <label htmlFor="v-phone" className="field-label">{t('volunteer.phone')}</label>
                  <input id="v-phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="+234…" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="v-lga" className="field-label">{t('volunteer.lga')} *</label>
                  <select id="v-lga" name="lga" required className="field">
                    {LGAS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="v-role" className="field-label">{t('volunteer.role')} *</label>
                  <select id="v-role" name="role" required className="field">
                    {ROLES.map((r) => <option key={r} value={r}>{t(`volunteer.roles.${r}`)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="v-msg" className="field-label">{t('volunteer.message')}</label>
                <textarea id="v-msg" name="message" rows={3} className="field resize-y" />
              </div>
              <button type="submit" disabled={busy} className="btn btn-yellow btn-block">
                {busy ? t('volunteer.submitting') : t('volunteer.submit')}
              </button>
              <p className="text-center text-xs text-ink-400 dark:text-ink-200/60">
                {t('volunteer.noAccount')} <Link to="/volunteer/login" className="font-bold text-yellow-600 dark:text-yellow-300 hover:underline">{t('volunteer.loginBtn')}</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function VolunteerLogin() {
  const { t } = useTranslation();
  const { user, login, verify2fa, resend2fa } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    setBusy(true);
    try {
      if (needs2fa) {
        await verify2fa(fd.get('code').trim(), !!fd.get('trust'));
      } else {
        await login(fd.get('email').trim(), fd.get('password'));
      }
      toast(t('volunteer.dashWelcome'), 'success');
      navigate('/dashboard');
    } catch (err) {
      if (err && err.requires2fa) setNeeds2fa(true);
      toast(err.message, err.requires2fa ? 'info' : 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    try { await resend2fa(); toast(t('volunteer.codeResent'), 'info'); }
    catch (err) { toast(err.message, 'danger'); }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-32 pb-16 md:pt-40">
      <div data-reveal className="card rounded-3xl p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-700 text-white dark:bg-red-600"><SignIn size={26} weight="bold" aria-hidden="true" /></span>
        <h1 className="h-display mt-5 text-center text-2xl">{t('volunteer.loginTitle')}</h1>
        <p className="mt-2 text-center text-sm text-ink-500 dark:text-ink-200/70">{t('volunteer.lead')}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!needs2fa ? (
            <>
              <div>
                <label htmlFor="l-email" className="field-label">{t('volunteer.email')}</label>
                <input id="l-email" name="email" type="email" required autoComplete="email" className="field" />
              </div>
              <div>
                <label htmlFor="l-pass" className="field-label">{t('volunteer.password')}</label>
                <input id="l-pass" name="password" type="password" required minLength={8} autoComplete="current-password" className="field" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-500 dark:text-ink-200/70">{t('volunteer.codeSent')}</p>
              <div>
                <label htmlFor="l-code" className="field-label">{t('volunteer.code')}</label>
                <input id="l-code" name="code" type="text" required inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} className="field" />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-200/70">
                <input type="checkbox" name="trust" className="h-4 w-4" /> {t('volunteer.trustDevice')}
              </label>
            </>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary btn-block">
            {busy ? t('common.loading') : t('volunteer.loginBtn')}
          </button>
          {needs2fa && (
            <button type="button" onClick={resend} className="btn btn-outline btn-block">
              {t('volunteer.resendCode')}
            </button>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-ink-500 dark:text-ink-200/70">
          {t('volunteer.noAccount')}
          <Link to="/volunteer" className="font-bold text-yellow-600 dark:text-yellow-300 hover:underline"> {t('volunteer.createBtn')}</Link>
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, ready, logout } = useAuth();
  const [data, setData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api('/volunteers/me').then((d) => { if (!cancelled) setData(d); }).catch((e) => toast(e.message, 'danger'));
    return () => { cancelled = true; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useReveal([data]);

  if (ready && !user) return <Navigate to="/volunteer/login" replace />;
  if (!user || !data) return <div className="pt-32 text-center text-ink-500">{t('common.loading')}</div>;

  const myEvents = data.registrations || [];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-8 md:pt-32">
      <header data-reveal className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{t('volunteer.dashWelcome')}</p>
          <h1 className="h-display mt-2 text-3xl md:text-4xl">{user.name}</h1>
          <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-200/70">{t('volunteer.dashSub')}</p>
        </div>
        <button type="button" onClick={logout} className="btn btn-outline btn-sm">{t('volunteer.logout')}</button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div data-reveal className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{t('volunteer.myRole')}</p>
          <p className="mt-2 font-display text-lg font-bold text-ink dark:text-white">{t(`volunteer.roles.${data.volunteer.volunteer_role}`)}</p>
          <p className="text-xs text-ink-500 dark:text-ink-200/70 mt-1">{data.volunteer.lga}</p>
        </div>
        <div data-reveal className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{t('volunteer.myEvents')}</p>
          <p className="mt-2 font-display text-3xl font-black text-yellow-600 dark:text-yellow-300">{myEvents.length}</p>
        </div>
        <div data-reveal className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{t('volunteer.impactLabel')}</p>
          <p className="mt-2 font-display text-3xl font-black text-yellow-600 dark:text-yellow-300">{data.volunteer.hours || 0}</p>
        </div>
      </div>

      <section data-reveal className="mt-10" aria-labelledby="my-events-title">
        <h2 id="my-events-title" className="font-display text-xl font-bold text-ink dark:text-white mb-4">{t('volunteer.myEvents')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {myEvents.map((r) => (
            <Link key={r.id} to={`/events/${r.event_id}`} className="card card-hover flex items-center gap-4 p-5 group">
              <Cover src={r.image_url} className="h-12 w-14 shrink-0 rounded-xl" icon={<CalendarDots size={20} weight="bold" aria-hidden="true" />} iconWrapClass="text-white/30" />
              <div className="min-w-0">
                <p className="font-bold text-ink dark:text-white truncate group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">
                  {(i18n.language === 'ha' && r.title_ha) || r.title}
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-200/70 mt-0.5">
                  {new Date(r.starts_at).toLocaleDateString(i18n.language === 'ha' ? 'ha-NG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
          {!myEvents.length && (
            <div className="card p-6 text-center text-sm text-ink-500 dark:text-ink-200/70 sm:col-span-2">
              <ChatCircleText size={28} className="mx-auto text-ink-300 dark:text-ink-400" aria-hidden="true" />
              <p className="mt-3">{t('events.upcomingEmpty')}</p>
              <Link to="/events" className="btn btn-primary btn-sm mt-4">{t('events.title')}</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
