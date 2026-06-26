'use client';

import { ArrowRight } from 'lucide-react';
import { WARDROBE_IMAGE_FALLBACK } from '@/features/face-studio/constants/bodyVtonMockData';

function handleImageError(event) {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = WARDROBE_IMAGE_FALLBACK;
}

/** Dev-mode pairing: body scan + selected garment side by side (no fake body overlay). */
export function VtonMockPairingView({
  bodyImage,
  garment,
  compact = false,
  aiReady = false,
  onRunAiFit,
  isGenerating = false,
}) {
  if (!garment?.img) return null;

  if (compact) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bodyImage}
          alt="Body scan"
          className="h-full w-full object-contain"
          onError={handleImageError}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={garment.img}
          alt={garment.name}
          className="h-full w-full rounded-md bg-black/30 object-contain p-1"
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-[1fr_auto_1fr]">
      <div className="flex min-w-0 items-center justify-center p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bodyImage}
          alt="Your body scan"
          className="max-h-full w-full object-contain"
          onError={handleImageError}
        />
      </div>

      <div className="flex items-center justify-center px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10">
          <ArrowRight className="h-4 w-4 text-pink-400" aria-hidden />
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-center justify-center gap-3 border-l border-white/10 bg-gradient-to-b from-[#150d22]/80 to-[#0a0612] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-400">
          Selected garment
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={garment.img}
          alt={garment.name}
          className="max-h-[50%] w-full rounded-lg object-contain"
          onError={handleImageError}
        />
        <p className="text-center text-sm font-semibold text-white">{garment.name}</p>
        {!compact && (
          <>
            {aiReady ? (
              <button
                type="button"
                onClick={onRunAiFit}
                disabled={isGenerating}
                className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? 'Running AI fit…' : 'Run AI Fitting'}
              </button>
            ) : (
              <div className="flex max-w-[220px] flex-col items-center gap-3">
                <p className="text-center text-[11px] leading-relaxed text-slate-400">
                  Dev pairing only. Start real AI in terminal:
                </p>
                <code className="rounded bg-black/40 px-2 py-1 text-[10px] text-pink-300">
                  cd vton-backend; .\start-real.ps1
                </code>
                <p className="text-center text-[10px] text-slate-500">
                  The Run AI Fitting button appears automatically when the service is ready.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
