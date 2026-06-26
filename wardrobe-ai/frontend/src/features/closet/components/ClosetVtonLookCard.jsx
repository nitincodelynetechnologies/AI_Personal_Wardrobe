'use client';

import { cn } from '@/lib/utils';

const IMAGE_EXPIRED_PLACEHOLDER = 'https://via.placeholder.com/300x400?text=Image+Expired';

function handleImageError(event) {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = IMAGE_EXPIRED_PLACEHOLDER;
}

export function ClosetVtonLookCard({ look, className }) {
  const finalImage = look?.finalImage ?? look?.resultImage ?? look?.baseImage;
  const garmentName = look?.garmentName ?? look?.garment?.name ?? 'Saved Look';
  const category = look?.category ?? look?.garment?.type ?? look?.garment?.category ?? 'Outfit';

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#130f22] shadow-xl dark:bg-[#130f22]',
        className,
      )}
    >
      <div className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-black/50">
        {finalImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={finalImage}
            alt={garmentName}
            className="h-full w-full object-contain"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            No saved image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 bg-black/20 p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500">{category}</span>
        <h4 className="line-clamp-1 text-sm font-semibold text-white">{garmentName}</h4>
        <p className="mt-2 text-xs text-slate-400">Saved: {look?.date || 'Recently'}</p>
      </div>
    </article>
  );
}
