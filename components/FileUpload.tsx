'use client';

import { useRef, useState } from 'react';
import { formatBytes, cn } from '@/lib/utils';

export interface PendingFile {
  file: File;
  kind: 'screenshot' | 'log';
}

export default function FileUpload({
  kind,
  label,
  hint,
  accept,
  files,
  onChange,
  max = 6,
}: {
  kind: 'screenshot' | 'log';
  label: string;
  hint: string;
  accept: string;
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, max);
    onChange(next);
  }

  return (
    <div>
      <p className="label">{label}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed border-charcoal-700 bg-charcoal-900/50 px-4 py-6 text-center transition-colors hover:border-moss-600/60',
          dragOver && 'border-moss-500 bg-moss-500/5'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="text-sm text-charcoal-300">
          Drag & drop or <span className="text-moss-400 underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-charcoal-500">{hint}</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md bg-charcoal-900 px-3 py-2 text-xs">
              <span className="truncate text-charcoal-300">{f.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-charcoal-500">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                  className="text-charcoal-500 hover:text-ember-400"
                  aria-label={`Remove ${f.name}`}
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" value={kind} readOnly />
    </div>
  );
}
