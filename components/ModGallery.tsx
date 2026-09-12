'use client';

import { useState } from 'react';
import Image from 'next/image';

const YOUTUBE_ID = '0PuzrNHvouw';

type GalleryItem =
  | { type: 'video'; label: string; caption: string; youtubeId: string; thumbnail: string }
  | { type: 'image'; label: string; caption: string; src: string };

const ITEMS: GalleryItem[] = [
  {
    type: 'video',
    label: 'Watch',
    caption: 'See XylemmOBS recording gameplay in real time',
    youtubeId: YOUTUBE_ID,
    thumbnail: `https://img.youtube.com/vi/${YOUTUBE_ID}/hqdefault.jpg`,
  },
  { type: 'image', label: 'General', caption: 'Start, pause, and manage recordings', src: '/gallery/general.png' },
  { type: 'image', label: 'Video', caption: 'Resolution, FPS, and container settings', src: '/gallery/video.png' },
  { type: 'image', label: 'Encoder', caption: 'Bitrate, codec, and quality controls', src: '/gallery/encoder.png' },
];

export default function ModGallery() {
  const [active, setActive] = useState(0);
  const current = ITEMS[active];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">See XylemmOBS in Action</h2>
      </div>

      <div className="card-interactive overflow-hidden p-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-charcoal-800 bg-black">
          {current.type === 'video' ? (
            <iframe
              key={current.youtubeId}
              src={`https://www.youtube.com/embed/${current.youtubeId}`}
              title="XylemmOBS demo video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <Image
              src={current.src}
              alt={`XylemmOBS ${current.label} settings`}
              fill
              className="object-contain transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {ITEMS.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActive(i)}
            className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
              active === i ? 'border-moss-500 shadow-glow' : 'border-charcoal-800 hover:border-moss-600/50'
            }`}
          >
            <div className="relative aspect-video w-full bg-black">
              <Image
                src={item.type === 'video' ? item.thumbnail : item.src}
                alt={item.label}
                fill
                unoptimized={item.type === 'video'}
                className={`object-cover transition-opacity duration-300 ${active === i ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`}
                sizes="200px"
              />
              {item.type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/70">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 py-1.5 text-left">
              <p className="text-xs font-semibold text-white">{item.label}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-charcoal-500">{current.caption}</p>
    </section>
  );
}
