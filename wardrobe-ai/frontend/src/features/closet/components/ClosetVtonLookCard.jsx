'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const IMAGE_EXPIRED_PLACEHOLDER = 'https://via.placeholder.com/300x400?text=Image+Expired';
const PIECE_IMAGE_SIZES = '120px';

function handleImageError(event) {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = IMAGE_EXPIRED_PLACEHOLDER;
}

function formatSavedDate(date) {
  if (!date) return 'Recently';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function StudioPiecesPreview({ pieces }) {
  const slots = [
    { key: 'top', label: 'Top', item: pieces?.top },
    { key: 'bottom', label: 'Bottom', item: pieces?.bottom },
    { key: 'footwear', label: 'Shoes', item: pieces?.footwear },
  ].filter((slot) => slot.item?.image_url);

  if (!slots.length) return null;

  return (
    <div className="grid grid-cols-3 gap-1.5 p-3">
      {slots.map((slot) => (
        <div
          key={slot.key}
          className="relative aspect-[3/4] overflow-hidden rounded-md bg-black/40"
        >
          <Image
            src={slot.item.image_url}
            alt={slot.item.sub_category || slot.label}
            fill
            sizes={PIECE_IMAGE_SIZES}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function ClosetVtonLookCard({ look, onDelete, className }) {
  const image = look?.image ?? look?.finalImage ?? look?.resultImage ?? look?.baseImage;
  const garmentName = look?.name ?? look?.garmentName ?? look?.garment?.name ?? 'Saved Look';
  const category = look?.category ?? look?.garment?.type ?? look?.garment?.category ?? 'Outfit';
  const savedAt = look?.savedAt ?? look?.date ?? look?.timestamp;
  const hasStudioPieces = Boolean(look?.pieces?.top?.image_url || look?.pieces?.bottom?.image_url);

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#130f22] shadow-xl dark:bg-[#130f22]',
        className,
      )}
    >
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(look.id)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-slate-300 opacity-0 backdrop-blur-sm transition-all hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
          aria-label={`Remove ${garmentName} from closet`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <div
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden bg-black/50',
          hasStudioPieces ? 'min-h-[10rem]' : 'h-72',
        )}
      >
        {hasStudioPieces ? (
          <StudioPiecesPreview pieces={look.pieces} />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`Saved look: ${garmentName}`}
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
        {look?.styleScore != null && (
          <p className="text-xs text-violet-300">{look.styleScore}% style match</p>
        )}
        <p className="mt-2 text-xs text-slate-400">Saved: {formatSavedDate(savedAt)}</p>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(look.id)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-transparent px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 sm:hidden"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove from Closet
          </button>
        )}
      </div>
    </article>
  );
}
