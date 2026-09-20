import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, CalendarDots, Users, Globe, Share, Check, CalendarX } from '@phosphor-icons/react';
import SectionTitle from '../components/SectionTitle.jsx';
import Cover from '../components/Cover.jsx';
import { useReveal } from '../hooks/motion.js';
import { useAuth } from '../hooks/auth.jsx';
import { useToast } from '../components/Toast.jsx';
import api, { fmtDateTime } from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

export function EventsList() {
  const { t, i18n } = useTranslation();
  const [rawEvents, setEvents] = useState([]);
  const events = useDbTranslate(rawEvents);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    api('/events').then((d) => { if (!cancelled) setEvents(d.items); }).catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language, user]);

  useReveal([events]);

  const ha = i18n.language === 'ha';
  const pick = (obj, field) => (obj && ((ha && obj[`${field}_ha`]) || obj[field])) || '';
  const upcoming = events.filter((e) => new Date(e.starts_at) >= new Date());
  const past = events.filter((e) => new Date(e.starts_at) < new Date());

  const EventCard = ({ ev }) => (
    <Link to={`/events/${ev.id}`} key={ev.id} data-reveal className="card card-hover group overflow-hidden p-0 flex flex-col">
      <Cover
        src={ev.image_url}
        className="h-44 w-full"
        alt=""
        icon={<CalendarX size={36} weight="bold" aria-hidden="true" />}
      />
      <div className="flex grow flex-col p-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-400 to-red-500 text-ink-950">
            <div className="text-center leading-none">
              <div className="font-display text-2xl font-black">{new Date(ev.starts_at).getDate()}</div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide">{new Date(ev.starts_at).toLocaleDateString('en', { month: 'short' })}</div>
            </div>
          </div>
          <span className={`badge ${new Date(ev.starts_at) >= new Date() ? 'badge-red' : 'badge-line'}`}>
            {new Date(ev.starts_at) >= new Date() ? 'Upcoming' : 'Past'}
          </span>
        </div>
        <h2 className="mt-4 font-display text-xl font-bold leading-snug text-ink dark:text-white group-hover:text-ink-600 dark:group-hover:text-yellow-300 transition-colors">
          {pick(ev, 'title')}
        </h2>
        <p className="mt-1.5 text-xs font-semibold text-ink-500 dark:text-ink-200/70">{fmtDateTime(ev.starts_at, i18n.language)}</p>
        <p className="mt-3 grow text-sm text-ink-500 dark:text-ink-200/75 leading-relaxed line-clamp-2">{pick(ev, 'description')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-200/70">
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} weight="fill" className="text-yellow-500" aria-hidden="true" /> {ev.is_online ? t('events.online') : ev.venue}</span>
          <span className="inline-flex items-center gap-1.5"><Users size={14} weight="fill" className="text-yellow-500" aria-hidden="true" /> {ev.attendee_count || 0}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow">{t('brand.party')}</p>
        <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('events.title')}</h1>
        <p className="lead mt-4 text-xl">{t('events.lead')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </div>

      {upcoming.length > 0 && (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      )}
      {upcoming.length === 0 && <p className="mt-10 text-ink-500 dark:text-ink-200/70">{t('events.upcomingEmpty')}</p>}

      {past.length > 0 && (
        <section className="mt-16" aria-labelledby="past-events">
          <h2 id="past-events" className="font-display text-2xl font-bold text-ink dark:text-white mb-5">{t('events.pastTitle')}</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 opacity-75">
            {past.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export function EventDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [rawEvent, setEvent] = useState(null);
  const [busy, setBusy] = useState(false);
  const event = useDbTranslate(rawEvent);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api(`/events/${id}`).then((d) => { if (!cancelled) setEvent(d.event); }).catch(() => {});
    return () => { cancelled = true; };
  }, [id, i18n.language]);

  useReveal([event]);

  if (!event) return <div className="pt-32 text-center text-ink-500">{t('common.loading')}</div>;

  const ha = i18n.language === 'ha';
  const pick = (field) => (event ? (ha && event[`${field}_ha`]) || event[field] || '' : '');
  const registered = Boolean(user && (event.my_registration || justRegistered));
  const seatsLeft = event.capacity ? Math.max(event.capacity - (event.attendee_count || 0), 0) : null;

  async function register() {
    setBusy(true);
    try {
      await api(`/events/${id}/register`, { method: 'POST' });
      setJustRegistered(true);
      toast(t('volunteer.registerSuccess'), 'success');
      const d = await api(`/events/${id}`);
      setEvent(d.event);
      refresh();
    } catch (e) {
      toast(e.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: pick('title'), url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast('Link copied', 'success'));
    }
  }

  return (
    <article className="mx-auto max-w-3xl px-4 pt-28 pb-8 md:pt-32">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 dark:text-ink-200 hover:text-ink dark:hover:text-white transition-colors" data-reveal>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" /> {t('events.title')}
      </Link>

      <header data-reveal className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${new Date(event.starts_at) >= new Date() ? 'badge-red' : 'badge-line'}`}>
            {new Date(event.starts_at) >= new Date() ? 'Upcoming' : 'Past'}
          </span>
          {event.is_online && <span className="badge badge-yellow"><Globe size={11} weight="fill" aria-hidden="true" /> {t('events.online')}</span>}
        </div>
        <h1 className="h-display mt-3 text-3xl md:text-5xl text-balance">{pick('title')}</h1>
        <p className="lead mt-4">{pick('description')}</p>
      </header>

      {event.image_url && (
        <figure data-reveal className="mt-7 overflow-hidden rounded-2xl">
          <Cover src={event.image_url} alt="" className="w-full max-h-80 md:aspect-[3/1]" icon={<CalendarX size={48} weight="bold" aria-hidden="true" />} />
        </figure>
      )}

      <div data-reveal className="card mt-8 divide-y divide-ink-100 dark:divide-ink-700/50">
        <div className="flex items-start gap-3.5 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300"><CalendarDots size={20} weight="bold" aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{t('events.title')}</p>
            <p className="mt-0.5 font-semibold text-ink dark:text-white">{fmtDateTime(event.starts_at, i18n.language)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300"><MapPin size={20} weight="bold" aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{t('events.venueLabel')}</p>
            <p className="mt-0.5 font-semibold text-ink dark:text-white">{event.is_online ? t('events.online') : event.venue}</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300"><Users size={20} weight="bold" aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-200/60">{t('hero.statVolunteers')}</p>
            <p className="mt-0.5 font-semibold text-ink dark:text-white">
              {event.attendee_count || 0}{seatsLeft !== null ? ` / ${event.capacity}` : ''}
              {seatsLeft !== null && seatsLeft < 30 && <span className="ml-2 text-amber-600 dark:text-amber-400 text-sm font-semibold">({t('events.seatsLeft', { count: seatsLeft })})</span>}
            </p>
          </div>
        </div>
      </div>

      {new Date(event.starts_at) >= new Date() && (
        <div data-reveal className="mt-8 flex flex-wrap gap-3">
          {registered ? (
            <span className="btn btn-outline" aria-live="polite">
              <Check size={17} weight="bold" className="text-emerald-500" aria-hidden="true" /> {t('events.registered')}
            </span>
          ) : user ? (
            <button type="button" onClick={register} disabled={busy} className="btn btn-primary">
              {busy ? t('common.loading') : t('events.register')}
            </button>
          ) : (
            <Link to="/volunteer/login" className="btn btn-primary">{t('nav.signIn')} — {t('events.register')}</Link>
          )}
          <button type="button" onClick={share} className="btn btn-outline">
            <Share size={16} weight="bold" aria-hidden="true" /> {t('events.share')}
          </button>
        </div>
      )}
    </article>
  );
}
