'use client';

import { useState } from 'react';
import Image from 'next/image';

const SHOTS = [
  { src: '/gallery/general.png', label: 'General', caption: 'Start, pause, and manage recordings' },
  { src: '/gallery/video.png', label: 'Video', caption: 'Resolution, FPS, and container settings' },
  { src: '/gallery/encoder.png', label: 'Encoder', caption: 'Bitrate, codec, and quality controls' },
];

export default function ModGallery() {
  const [active, setActive] = useState(0);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-50">See XylemmOBS in Action</h2>
          <p className="mt-1 text-sm text-charcoal-500">A look at the in-game settings menu.</p>
        </div>
      </div>

      <div className="card-interactive overflow-hidden p-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-charcoal-800 bg-charcoal-950">
          <Image
            src={SHOTS[active].src}
            alt={`XylemmOBS ${SHOTS[active].label} settings`}
            fill
            className="object-contain transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {SHOTS.map((shot, i) => (
          <button
            key={shot.src}
            onClick={() => setActive(i)}
            className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
              active === i ? 'border-moss-500 shadow-glow' : 'border-charcoal-800 hover:border-moss-600/50'
            }`}
          >
            <div className="relative aspect-video w-full bg-charcoal-950">
              <Image
                src={shot.src}
                alt={shot.label}
                fill
                className={`object-cover transition-opacity duration-300 ${active === i ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`}
                sizes="200px"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 py-1.5 text-left">
              <p className="text-xs font-semibold text-white">{shot.label}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-charcoal-500">{SHOTS[active].caption}</p>
    </section>
  );
}
