import { useEffect, useState } from 'react';

export default function Cover({ src, alt = '', className = '', icon, iconWrapClass = 'text-yellow-300/40' }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => { setFailed(!src); }, [src]);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-950 ${className}`} aria-hidden={alt ? undefined : true}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : icon ? (
        <div className={`grid h-full w-full place-items-center ${iconWrapClass}`}>{icon}</div>
      ) : null}
    </div>
  );
}