import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayCircle, Image as ImageIcon, YoutubeLogo } from '@phosphor-icons/react';
import SectionTitle from '../components/SectionTitle.jsx';
import { useReveal } from '../hooks/motion.js';
import api from '../lib/api.js';
import useDbTranslate from '../hooks/useDbTranslate.js';

const ytEmbed = (url) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
};

function MediaPhoto({ photo, pick }) {
  const [failed, setFailed] = useState(!photo.image_url);
  return (
    <figure data-reveal className="card group relative overflow-hidden rounded-2xl break-inside-avoid">
      <div className="relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-950">
        {photo.image_url && !failed ? (
          <img
            src={photo.image_url}
            alt={pick(photo, 'caption') || ''}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="grid h-48 w-full place-items-center"><ImageIcon size={40} weight="bold" className="text-yellow-300/40" aria-hidden="true" /></div>
        )}
      </div>
      {pick(photo, 'caption') && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-4 pt-8 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {pick(photo, 'caption')}
        </figcaption>
      )}
    </figure>
  );
}

export default function Media() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('photos');
  const [rawMedia, setMedia] = useState({ photos: [], videos: [] });
  const media = useDbTranslate(rawMedia);

  useEffect(() => {
    let cancelled = false;
    api('/media').then((d) => { if (!cancelled) setMedia({ photos: d.photos || [], videos: d.videos || [] }); }).catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language]);

  useReveal([media, tab]);

  const ha = i18n.language === 'ha';
  const pick = (obj, field) => (obj && ((ha && obj[`${field}_ha`]) || obj[field])) || '';

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 md:pt-32">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow">{t('brand.party')}</p>
        <h1 className="h-display mt-3 text-4xl md:text-6xl text-balance">{t('media.title')}</h1>
        <p className="lead mt-4 text-xl">{t('media.lead')}</p>
        <div className="yellow-rule mt-6" aria-hidden="true" />
      </div>

      <div data-reveal className="mt-8 flex gap-2" role="tablist" aria-label="Media type">
        <button type="button" role="tab" aria-selected={tab === 'photos'} onClick={() => setTab('photos')} className={`btn btn-sm ${tab === 'photos' ? 'btn-primary' : 'btn-outline'}`}>
          <ImageIcon size={15} weight="bold" aria-hidden="true" /> {t('media.photos')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'videos'} onClick={() => setTab('videos')} className={`btn btn-sm ${tab === 'videos' ? 'btn-primary' : 'btn-outline'}`}>
          <PlayCircle size={15} weight="bold" aria-hidden="true" /> {t('media.videos')}
        </button>
      </div>

      {tab === 'photos' && (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {media.photos.map((p) => (
            <MediaPhoto key={p.id} photo={p} pick={pick} />
          ))}
          {!media.photos.length && <p className="text-ink-500 dark:text-ink-200/70">—</p>}
        </div>
      )}

      {tab === 'videos' && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {media.videos.map((v) => (
            <div key={v.id} data-reveal className="card overflow-hidden rounded-2xl">
              <div className="aspect-video bg-ink-950">
                <iframe
                  src={ytEmbed(v.video_url)}
                  title={pick(v, 'title')}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h2 className="font-display font-bold text-ink dark:text-white leading-snug">{pick(v, 'title')}</h2>
                {pick(v, 'description') && <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-200/75">{pick(v, 'description')}</p>}
                <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                  <YoutubeLogo size={15} weight="fill" aria-hidden="true" /> {t('media.watchOn')} YouTube
                </a>
              </div>
            </div>
          ))}
          {!media.videos.length && <p className="text-ink-500 dark:text-ink-200/70">—</p>}
        </div>
      )}
    </div>
  );
}
