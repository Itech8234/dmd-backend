import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Newspaper, PlayCircle, Scroll, CalendarDots, HandHeart, Envelope,
  Sigma, ShieldCheck, ArrowsOutSimple, SignOut, Warning,
  Plus, PencilSimple, Trash, CheckCircle, Circle, Users, House, X, MapTrifold,
} from '@phosphor-icons/react';
import { useAuth } from '../hooks/auth.jsx';
import { useToast } from '../components/Toast.jsx';
import api, { fmtDate, fmtDateTime } from '../lib/api.js';

/* ────────────────────────────── helpers ────────────────────────────── */

export function Loading({ label }) {
  return (
    <div className="py-16 text-center" role="status" aria-live="polite">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-yellow/30 border-t-yellow" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-ink-500 dark:text-ink-200/70">{label}</p>
    </div>
  );
}

export function Empty({ label }) {
  return (
    <div className="card p-10 text-center text-sm text-ink-500 dark:text-ink-200/70" role="status">
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card border-l-4 border-l-red-500 p-6 text-center" role="alert">
      <Warning size={26} weight="fill" className="mx-auto text-red-500" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-ink dark:text-white">{error?.message || 'Something went wrong.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-outline btn-sm mt-4">{onRetry}</button>
      )}
    </div>
  );
}

const inputCls = 'field';
const labelCls = 'field-label';

function Field({ label, name, type = 'text', value, onChange, required, rows, options, placeholder }) {
  const id = `af-${name}`;
  if (type === 'select') {
    return (
      <div>
        <label htmlFor={id} className={labelCls}>{label}</label>
        <select id={id} name={name} value={value ?? ''} onChange={onChange} required={required} className={inputCls}>
          {(options || []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  if (type === 'textarea') {
    return (
      <div className={rows ? 'sm:col-span-2' : ''}>
        <label htmlFor={id} className={labelCls}>{label}</label>
        <textarea id={id} name={name} value={value ?? ''} onChange={onChange} required={required} rows={rows || 3} className={`${inputCls} resize-y`} />
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} name={name} type={type} value={value ?? ''} onChange={onChange} required={required} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

/* ─────────────────────── generic CRUD manager ─────────────────────── */

function CrudManager({ endpoint, title, columns, fields, emptyLabel, addLabel, listKey = 'items', defaultItem }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await api(endpoint);
      setItems(d[listKey] || d);
    } catch (e) {
      setError(e);
    }
  }, [endpoint, listKey]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    const base = {};
    fields.forEach((f) => { base[f.name] = f.default ?? ''; });
    setForm({ ...(defaultItem || {}), ...base });
    setEditing('new');
  };
  const openEdit = (item) => {
    const base = {};
    fields.forEach((f) => {
      const val = f.from ? item[f.from] : item[f.name];
      base[f.name] = val ?? f.default ?? '';
    });
    setForm(base);
    setEditing(item);
  };

  const setVal = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const fileField = fields.find((f) => f.type === 'file');
      const hasFile = fileField && form[fileField.name] instanceof File;
      let body;
      if (hasFile) {
        body = new FormData();
        fields.forEach((f) => {
          const v = form[f.name];
          if (v === null || v === undefined || v === '') return;
          if (f.type === 'file' && !(v instanceof File)) return;
          if (f.type === 'boolean') body.append(f.name, v ? 'true' : 'false');
          else body.append(f.name, v);
        });
      } else {
        body = {};
        fields.forEach((f) => {
          const v = form[f.name];
          if (f.type === 'file') return; // no new file chosen — keep existing
          if (v === '' && !f.required) return;
          body[f.name] = v;
        });
      }
      const isNew = editing === 'new';
      await api(isNew ? endpoint : `${endpoint}/${editing.id}`, {
        method: isNew ? 'POST' : (hasFile ? 'PUT' : 'PATCH'),
        body,
      });
      toast(isNew ? t('admin.created') : t('admin.updated'), 'success');
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await api(`${endpoint}/${item.id}`, { method: 'DELETE' });
      toast(t('admin.deleted'), 'success');
      load();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">{title}</h2>
        <button type="button" onClick={openNew} className="btn btn-primary btn-sm gap-1.5">
          <Plus size={15} weight="bold" aria-hidden="true" /> {addLabel}
        </button>
      </div>

      {error && <div className="mt-6"><ErrorState error={error} onRetry={t('common.retry')} /></div>}
      {!error && !items && <Loading label={t('common.loading')} />}
      {items && !items.length && <div className="mt-6"><Empty label={emptyLabel} /></div>}

      {items && items.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100/70 dark:border-ink-700/50">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-ink-100/70 bg-paper-soft text-left text-xs font-bold uppercase tracking-wide text-ink-500 dark:border-ink-700/50 dark:bg-ink-900/60 dark:text-ink-200/70">
                {columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
                <th className="px-4 py-3 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/60 dark:divide-ink-700/40">
              {items.map((item) => (
                <tr key={item.id} className="text-ink-700 dark:text-ink-100/85">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-middle">{c.render ? c.render(item) : (item[c.key] ?? '—')}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => openEdit(item)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink/10 dark:text-ink-200 dark:hover:bg-white/10 cursor-pointer transition-colors" aria-label={`${t('admin.edit')} — ${item.title || item.full_name || item.year || item.id}`}>
                        <PencilSimple size={16} weight="bold" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => remove(item)} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red/10 cursor-pointer transition-colors" aria-label={`${t('admin.delete')} — ${item.title || item.full_name || item.year || item.id}`}>
                        <Trash size={16} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/60 p-4" role="dialog" aria-modal="true" aria-label={editing === 'new' ? addLabel : t('admin.edit')}>
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-card-hover dark:bg-ink-900 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                {editing === 'new' ? addLabel : `${t('admin.edit')} — ${form.title || form.full_name || form.year || ''}`}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink/10 dark:text-ink-200 dark:hover:bg-white/10 cursor-pointer" aria-label={t('common.cancel')}>
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <Field
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={setVal}
                  required={f.required}
                  rows={f.rows}
                  options={f.options}
                  placeholder={f.placeholder}
                />
              ))}
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={busy} className="btn btn-primary grow">
                  {busy ? t('common.loading') : t('admin.save')}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── special admin pages ────────────────────── */

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/admin/stats').then((d) => { if (!cancelled) setStats(d); }).catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <ErrorState error={error} />;
  if (!stats) return <Loading label={t('common.loading')} />;

  const cards = [
    { icon: Newspaper, label: t('admin.cardNews'), value: stats.news, to: '/admin/news', tone: 'bg-ink-100 text-ink-700 dark:bg-ink-500/25 dark:text-ink-200' },
    { icon: CalendarDots, label: t('admin.cardEvents'), value: stats.events, to: '/admin/events', tone: 'bg-yellow-100 text-yellow-600 dark:bg-yellow/20 dark:text-yellow-300' },
    { icon: HandHeart, label: t('admin.cardVolunteers'), value: stats.volunteers, to: '/admin/volunteers', tone: 'bg-red-100 text-red-600 dark:bg-red/20 dark:text-red-400' },
    { icon: Envelope, label: t('admin.cardMessages'), value: stats.messages, to: '/admin/messages', tone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    { icon: PlayCircle, label: t('admin.cardMedia'), value: stats.media, to: '/admin/media', tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300' },
    { icon: Scroll, label: t('admin.cardPolicies'), value: stats.policies, to: '/admin/policies', tone: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300' },
  ];

  const show = (v) => (v && typeof v === 'object') ? (v.total ?? '—') : (v ?? '—');

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink dark:text-white">{t('admin.dashboard')}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="card card-hover flex items-center gap-4 p-5 group">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${c.tone}`}>
                <Icon size={24} weight="bold" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-2xl font-black text-ink dark:text-white leading-none">{show(c.value)}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-200/70">{c.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-ink dark:text-white">{t('admin.recentVolunteers')}</h3>
            <Users size={18} weight="bold" className="text-yellow-500" aria-hidden="true" />
          </div>
          <ul className="mt-4 divide-y divide-ink-100/60 dark:divide-ink-700/40">
            {(stats.recent_volunteers || []).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink dark:text-white">{v.full_name}</span>
                  <span className="block truncate text-xs text-ink-500 dark:text-ink-200/70">{v.email} · {v.lga || '—'}</span>
                </span>
                {v.verified
                  ? <span className="badge badge-green shrink-0"><CheckCircle size={11} weight="fill" aria-hidden="true" /> {t('admin.verified')}</span>
                  : <span className="badge badge-line shrink-0"><Circle size={11} weight="fill" aria-hidden="true" /> {t('admin.pending')}</span>}
              </li>
            ))}
            {!stats.recent_volunteers?.length && <li className="py-3 text-sm text-ink-500 dark:text-ink-200/70">{t('admin.emptyVolunteers')}</li>}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-ink dark:text-white">{t('admin.atAGlance')}</h3>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              [t('admin.publishedNews'), stats.news?.published],
              [t('admin.upcomingEvents'), stats.events?.upcoming],
              [t('admin.verifiedVolunteers'), stats.volunteers?.verified],
              [t('admin.eventRegistrations'), stats.registrations],
              [t('admin.subscribers'), stats.subscribers],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-ink-100/60 pb-2.5 last:border-0 dark:border-ink-700/40">
                <dt className="text-ink-500 dark:text-ink-200/70">{k}</dt>
                <dd className="font-display text-lg font-black text-ink dark:text-white">{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function VolunteersAdmin() {
  const { t } = useTranslation();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api('/admin/volunteers');
      setItems(d.items || d);
    } catch (e) { setError(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleVerify(v) {
    try {
      await api(`/admin/volunteers/${v.id}/verify`, { method: 'POST' });
      load();
    } catch (e) { toast(e.message, 'danger'); }
  }

  if (error) return <ErrorState error={error} />;
  if (!items) return <Loading label={t('common.loading')} />;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink dark:text-white">{t('admin.volunteers')}</h2>
      {!items.length && <div className="mt-6"><Empty label={t('admin.emptyVolunteers')} /></div>}
      {items.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100/70 dark:border-ink-700/50">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-100/70 bg-paper-soft text-left text-xs font-bold uppercase tracking-wide text-ink-500 dark:border-ink-700/50 dark:bg-ink-900/60 dark:text-ink-200/70">
                <th className="px-4 py-3">{t('volunteer.name')}</th>
                <th className="px-4 py-3">{t('volunteer.email')}</th>
                <th className="px-4 py-3">{t('volunteer.lga')}</th>
                <th className="px-4 py-3">{t('volunteer.role')}</th>
                <th className="px-4 py-3">{t('admin.status')}</th>
                <th className="px-4 py-3 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/60 dark:divide-ink-700/40">
              {items.map((v) => (
                <tr key={v.id} className="text-ink-700 dark:text-ink-100/85">
                  <td className="px-4 py-3 font-semibold text-ink dark:text-white">{v.full_name}</td>
                  <td className="px-4 py-3">{v.email}</td>
                  <td className="px-4 py-3">{v.lga || '—'}</td>
                  <td className="px-4 py-3">{v.activity}</td>
                  <td className="px-4 py-3">
                    {v.verified
                      ? <span className="badge badge-green"><CheckCircle size={11} weight="fill" aria-hidden="true" /> {t('admin.verified')}</span>
                      : <span className="badge badge-line"><Circle size={11} weight="fill" aria-hidden="true" /> {t('admin.pending')}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => toggleVerify(v)} className={`btn btn-sm ${v.verified ? 'btn-outline' : 'btn-primary'}`}>
                      {v.verified ? t('admin.unverify') : t('admin.verify')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MessagesAdmin() {
  const { t } = useTranslation();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api('/admin/messages');
      setItems(d.items || []);
    } catch (e) { setError(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleRead(m) {
    try {
      await api('/admin/messages', { method: 'POST', body: { id: m.id } });
      load();
    } catch (e) { toast(e.message, 'danger'); }
  }

  if (error) return <ErrorState error={error} />;
  if (!items) return <Loading label={t('common.loading')} />;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink dark:text-white">{t('admin.messages')}</h2>
      {!items.length && <div className="mt-6"><Empty label={t('admin.emptyMessages')} /></div>}
      <div className="mt-5 space-y-3">
        {items.map((m) => (
          <article key={m.id} className={`card p-5 ${m.read ? '' : 'border-l-4 border-l-yellow'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-ink dark:text-white">{m.subject}</h3>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-200/70">
                  {m.name} · <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a> · {fmtDate(m.created_at)}
                </p>
              </div>
              <button type="button" onClick={() => toggleRead(m)} className={`btn btn-sm ${m.read ? 'btn-outline' : 'btn-primary'}`}>
                {m.read ? t('admin.markUnread') : t('admin.markRead')}
              </button>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-100/85">{m.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const MEDIA_KIND_OPTIONS = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'banner', label: 'Banner' },
];

const PUBLISHED_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const StatusBadge = ({ status }) => (
  <span className={`badge ${status === 'published' ? 'badge-green' : status === 'draft' ? 'badge-line' : 'badge-yellow'}`}>{status}</span>
);

const NAV = [
  { to: '/admin', key: 'dashboard', icon: House, end: true },
  { to: '/admin/news', key: 'news', icon: Newspaper },
  { to: '/admin/media', key: 'media', icon: PlayCircle },
  { to: '/admin/policies', key: 'agenda', icon: Scroll },
  { to: '/admin/events', key: 'events', icon: CalendarDots },
  { to: '/admin/volunteers', key: 'volunteers', icon: HandHeart },
  { to: '/admin/messages', key: 'messages', icon: Envelope },
  { to: '/admin/sigma', key: 'sigma', icon: Sigma },
  { to: '/admin/roadmap', key: 'roadmap', icon: MapTrifold },
];

const CrudManagers = {
  news: (t) => ({
    endpoint: '/admin/news',
    title: t('admin.newsTitle'),
    emptyLabel: t('admin.emptyNews'),
    addLabel: t('admin.addNews'),
    columns: [
      { key: 'title', label: t('news.title'), render: (n) => <span className="font-semibold text-ink dark:text-white">{n.title}</span> },
      { key: 'category_name', label: t('admin.category') },
      { key: 'status', label: t('admin.status'), render: (n) => <StatusBadge status={n.status} /> },
      { key: 'published_at', label: t('admin.date'), render: (n) => fmtDate(n.published_at) },
    ],
    fields: [
      { name: 'title', label: t('news.title'), required: true },
      { name: 'excerpt', label: t('admin.excerpt'), type: 'textarea', rows: 2 },
      { name: 'content', label: t('admin.content'), type: 'textarea', rows: 8, required: true },
      { name: 'featured_image', label: t('admin.image'), type: 'file' },
      { name: 'status', label: t('admin.status'), type: 'select', options: STATUS_OPTIONS, default: 'draft' },
    ],
  }),
  media: (t) => ({
    endpoint: '/admin/media',
    title: t('admin.mediaTitle'),
    emptyLabel: t('admin.emptyMedia'),
    addLabel: t('admin.addMedia'),
    columns: [
      { key: 'title', label: t('media.title'), render: (m) => <span className="font-semibold text-ink dark:text-white">{m.title}</span> },
      { key: 'kind', label: t('admin.kind') },
      { key: 'published', label: t('admin.published'), render: (m) => (m.published ? t('admin.yes') : t('admin.no')) },
    ],
    fields: [
      { name: 'title', label: t('media.title'), required: true },
      { name: 'kind', label: t('admin.kind'), type: 'select', options: MEDIA_KIND_OPTIONS, default: 'image' },
      { name: 'file', label: t('admin.file'), type: 'file' },
      { name: 'video_url', label: t('admin.videoUrl'), placeholder: 'https://…' },
      { name: 'caption', label: t('admin.caption') },
      { name: 'alt_text', label: t('admin.altText') },
      { name: 'published', label: t('admin.published'), type: 'select', options: PUBLISHED_OPTIONS, default: 'true' },
    ],
  }),
};

Object.assign(CrudManagers, {
  policies: (t) => ({
    endpoint: '/admin/policies',
    title: t('admin.policiesTitle'),
    emptyLabel: t('admin.emptyPolicies'),
    addLabel: t('admin.addPolicy'),
    columns: [
      { key: 'title', label: t('agenda.title'), render: (p) => <span className="font-semibold text-ink dark:text-white">{p.title}</span> },
      { key: 'category_name', label: t('admin.category') },
      { key: 'status', label: t('admin.status'), render: (p) => <StatusBadge status={p.status} /> },
    ],
    fields: [
      { name: 'title', label: t('agenda.title'), required: true },
      { name: 'summary', label: t('admin.summary'), type: 'textarea', rows: 2, required: true },
      { name: 'description', label: t('admin.content'), type: 'textarea', rows: 6, required: true },
      { name: 'expected_impact', label: t('admin.targets'), type: 'textarea', rows: 4 },
      { name: 'featured_image', label: t('admin.image'), type: 'file' },
      { name: 'status', label: t('admin.status'), type: 'select', options: STATUS_OPTIONS, default: 'draft' },
    ],
  }),
  events: (t) => ({
    endpoint: '/admin/events',
    title: t('admin.eventsTitle'),
    emptyLabel: t('admin.emptyEvents'),
    addLabel: t('admin.addEvent'),
    columns: [
      { key: 'title', label: t('events.title'), render: (e) => <span className="font-semibold text-ink dark:text-white">{e.title}</span> },
      { key: 'venue', label: t('events.venueLabel') },
      { key: 'start', label: t('admin.date'), render: (e) => fmtDate(e.start) },
      { key: 'status', label: t('admin.status'), render: (e) => <StatusBadge status={e.status} /> },
    ],
    fields: [
      { name: 'title', label: t('events.title'), required: true },
      { name: 'description', label: t('admin.content'), type: 'textarea', rows: 4, required: true },
      { name: 'venue', label: t('events.venueLabel'), required: true },
      { name: 'start', label: t('admin.startsAt'), type: 'datetime-local', required: true },
      { name: 'end', label: t('admin.endsAt'), type: 'datetime-local' },
      { name: 'capacity', label: t('admin.capacity'), type: 'number' },
      { name: 'featured_image', label: t('admin.image'), type: 'file' },
      { name: 'status', label: t('admin.status'), type: 'select', options: STATUS_OPTIONS, default: 'draft' },
    ],
  }),
  sigma: (t) => ({
    endpoint: '/admin/sigma',
    title: t('admin.sigmaTitle'),
    emptyLabel: t('admin.emptySigma'),
    addLabel: t('admin.addSigma'),
    columns: [
      { key: 'letter', label: 'S.I.G.M.A.', render: (p) => <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-950 font-display text-sm font-black text-yellow-300 dark:bg-yellow dark:text-ink-950">{p.letter}</span> },
      { key: 'name', label: t('admin.system'), render: (p) => <span className="font-semibold text-ink dark:text-white">{p.name}</span> },
    ],
    fields: [
      { name: 'letter', label: t('admin.letter'), required: true, placeholder: 'S / I / G / M / A' },
      { name: 'name', label: t('admin.system'), required: true },
      { name: 'description', label: t('admin.description'), type: 'textarea', rows: 3, required: true },
      { name: 'order', label: t('admin.order'), type: 'number', default: 0 },
    ],
  }),
  roadmap: (t) => ({
    endpoint: '/admin/roadmap',
    title: t('admin.roadmapTitle'),
    emptyLabel: t('admin.emptyRoadmap'),
    addLabel: t('admin.addPhase'),
    columns: [
      { key: 'year', label: t('admin.year'), render: (p) => <span className="badge badge-yellow">{p.year}</span> },
      { key: 'title', label: t('admin.phaseTitle'), render: (p) => <span className="font-semibold text-ink dark:text-white">{p.title}</span> },
    ],
    fields: [
      { name: 'year', label: t('admin.year'), required: true, placeholder: '2027' },
      { name: 'title', label: t('admin.phaseTitle'), required: true },
      { name: 'description', label: t('admin.description'), type: 'textarea', rows: 2 },
      { name: 'milestones', label: t('admin.milestones'), type: 'textarea', rows: 5 },
      { name: 'order', label: t('admin.order'), type: 'number', default: 0 },
    ],
  }),
});

function AdminHome() {
  const { user, ready, isStaff, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (!ready) return <div className="pt-32"><Loading label={t('common.loading')} /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isStaff) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-36 pb-24 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-100 text-red-600 dark:bg-red/20 dark:text-red-400">
          <ShieldCheck size={30} weight="bold" aria-hidden="true" />
        </span>
        <h1 className="h-display mt-5 text-2xl">{t('admin.deniedTitle')}</h1>
        <p className="lead mt-3 text-sm">{t('admin.deniedText')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn btn-outline">{t('common.backHome')}</Link>
          <button type="button" onClick={logout} className="btn btn-primary">{t('volunteer.logout')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 md:pt-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{t('admin.eyebrow')}</p>
          <h1 className="h-display mt-1 text-2xl md:text-3xl">{t('admin.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-semibold text-ink-500 dark:text-ink-200/70 sm:block">{user.display_name}</span>
          <button type="button" onClick={logout} className="btn btn-outline btn-sm gap-1.5">
            <SignOut size={15} weight="bold" aria-hidden="true" /> {t('volunteer.logout')}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside>
          <nav className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 no-scrollbar" aria-label={t('admin.title')}>
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.key}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-ink-950 text-yellow-300 dark:bg-yellow dark:text-ink-950'
                      : 'text-ink-600 hover:bg-ink/8 dark:text-ink-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon size={17} weight="bold" aria-hidden="true" /> {t(`admin.nav.${n.key}`)}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="news" element={<CrudManager {...CrudManagers.news(t)} listKey="results" />} />
            <Route path="media" element={<CrudManager {...CrudManagers.media(t)} listKey="results" />} />
            <Route path="policies" element={<CrudManager {...CrudManagers.policies(t)} listKey="results" />} />
            <Route path="events" element={<CrudManager {...CrudManagers.events(t)} listKey="results" />} />
            <Route path="volunteers" element={<VolunteersAdmin />} />
            <Route path="messages" element={<MessagesAdmin />} />
            <Route path="sigma" element={<CrudManager {...CrudManagers.sigma(t)} listKey="results" />} />
            <Route path="roadmap" element={<CrudManager {...CrudManagers.roadmap(t)} listKey="results" />} />
            <Route path="*" element={<Empty label={t('common.notFoundText')} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const location = useLocation();
  return <AdminHome key={location.pathname} />;
}
