'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveProductImageUrl } from '@/features/catalog/constants/catalogOptions';
import { getTryOnGender } from '@/features/try-on/constants/tryOnOptions';

const FACE_SCALE_MIN = 0.75;
const FACE_SCALE_MAX = 1.45;
const FACE_SCALE_STEP = 0.05;
const FACE_Y_MIN = -48;
const FACE_Y_MAX = 48;
const FACE_Y_STEP = 2;

const NECK_MASK =
  'linear-gradient(to bottom, black 72%, rgba(0,0,0,0.85) 88%, transparent 100%)';

function getGarmentCompositor(product) {
  const category = product?.category ?? 'Men';
  const name = (product?.name ?? '').toLowerCase();
  const tags = Array.isArray(product?.style_tags) ? product.style_tags.join(' ').toLowerCase() : '';
  const haystack = `${name} ${tags}`;

  if (category === 'Footwear') {
    return { top: '62%', width: 168, height: 120, blend: 'multiply', zIndex: 22 };
  }

  if (category === 'Accessories') {
    return { top: '38%', width: 130, height: 130, blend: 'multiply', zIndex: 22 };
  }

  if (/dress|gown|midi|maxi|slip/i.test(haystack)) {
    return { top: 56, width: 230, height: 300, blend: 'multiply', zIndex: 20 };
  }

  if (/jean|trouser|pant|bottom|denim/i.test(haystack)) {
    return { top: 148, width: 210, height: 220, blend: 'multiply', zIndex: 20 };
  }

  if (/jacket|coat|blazer|hoodie|outerwear/i.test(haystack)) {
    return { top: 64, width: 228, height: 280, blend: 'multiply', zIndex: 20 };
  }

  return { top: 72, width: 220, height: 260, blend: 'multiply', zIndex: 20 };
}

function MannequinBase({ gender = 'male', className }) {
  const shoulder = gender === 'female' ? 72 : 78;

  return (
    <svg
      viewBox="0 0 200 420"
      aria-hidden
      className={cn('h-auto w-[200px] opacity-75', className)}
    >
      <defs>
        <linearGradient id="dummyBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="118" rx={shoulder} ry="22" fill="url(#dummyBody)" />
      <path
        d="M 58 118 Q 100 132 142 118 L 132 250 Q 100 268 68 250 Z"
        fill="url(#dummyBody)"
      />
      <path
        d="M 78 248 L 68 390 Q 100 402 132 390 L 122 248 Q 100 258 78 248 Z"
        fill="url(#dummyBody)"
      />
      <ellipse cx="100" cy="108" rx="34" ry="12" fill="#475569" opacity="0.45" />
    </svg>
  );
}

function ControlRow({ label, value, min, max, step, onChange, formatValue }) {
  const decrease = () => onChange(Math.max(min, Number((value - step).toFixed(2))));
  const increase = () => onChange(Math.min(max, Number((value + step).toFixed(2))));

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/55">
          {label}
        </span>
        <span className="font-mono text-[10px] text-fuchsia-300/90">{formatValue(value)}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrease}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-fuchsia-500/40 hover:text-white"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-fuchsia-500"
          aria-label={label}
        />
        <button
          type="button"
          onClick={increase}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-fuchsia-500/40 hover:text-white"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function Smart2DMannequin({ product, garmentImageUrl, userFaceUrl, className }) {
  const [faceScale, setFaceScale] = useState(1);
  const [faceY, setFaceY] = useState(0);

  const garmentSrc = garmentImageUrl || resolveProductImageUrl(product);
  const hasFace = Boolean(userFaceUrl?.trim());
  const gender = getTryOnGender(product?.category);
  const garmentLayout = useMemo(() => getGarmentCompositor(product), [product]);

  useEffect(() => {
    setFaceScale(1);
    setFaceY(0);
  }, [product?.id]);

  const garmentStyle = {
    top: typeof garmentLayout.top === 'number' ? `${garmentLayout.top}px` : garmentLayout.top,
    width: `${garmentLayout.width}px`,
    height: `${garmentLayout.height}px`,
    mixBlendMode: garmentLayout.blend,
    zIndex: garmentLayout.zIndex,
  };

  return (
    <div
      className={cn(
        'relative flex h-full min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#150d22] md:min-h-[500px]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,rgba(217,70,239,0.14),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1c132b]/80 via-transparent to-[#0a0612]" />

      <div className="absolute left-4 top-4 z-40 text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
        Smart 2D Compositing
      </div>

      <div className="relative mt-6 flex w-[300px] max-w-[88%] flex-1 items-start justify-center pb-28 [isolation:isolate]">
        <div className="relative h-[450px] w-full max-w-[300px]">
          <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2">
            <MannequinBase gender={gender} />
          </div>

          {/* Garment — multiply strips white catalog backgrounds on dark canvas */}
          <div className="absolute left-1/2 z-20 -translate-x-1/2" style={garmentStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={garmentSrc}
              alt={product?.name ?? 'Clothing layer'}
              className="h-full w-full object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.55)]"
              style={{ mixBlendMode: garmentLayout.blend }}
            />
          </div>

          {/* User face — neck-masked oval composited above collar */}
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2 transition-transform duration-200"
            style={{
              top: `${40 + faceY}px`,
              transform: `translateX(-50%) scale(${faceScale})`,
            }}
          >
            {hasFace ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userFaceUrl}
                alt="Your face"
                className="h-28 w-20 rounded-[40px] object-cover object-top shadow-[0_12px_30px_rgba(0,0,0,0.65)] ring-2 ring-[#150d22]"
                style={{
                  WebkitMaskImage: NECK_MASK,
                  maskImage: NECK_MASK,
                }}
              />
            ) : (
              <div className="flex h-28 w-20 flex-col items-center justify-center rounded-[40px] border border-white/10 bg-gradient-to-b from-[#2a1a3d] to-[#150d22] text-white/40 shadow-lg">
                <User className="h-8 w-8" strokeWidth={1.25} aria-hidden />
              </div>
            )}
          </div>
        </div>
      </div>

      {!hasFace && (
        <Link
          href="/face-studio"
          className="absolute right-4 top-4 z-40 rounded-full border border-fuchsia-500/30 bg-black/40 px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-fuchsia-300 backdrop-blur-sm transition-colors hover:text-fuchsia-200"
        >
          Add Face
        </Link>
      )}

      <div className="absolute inset-x-3 bottom-3 z-40 rounded-xl border border-white/10 bg-black/55 p-3 backdrop-blur-md">
        <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-white/45">
          Face alignment
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <ControlRow
            label="Scale"
            value={faceScale}
            min={FACE_SCALE_MIN}
            max={FACE_SCALE_MAX}
            step={FACE_SCALE_STEP}
            onChange={setFaceScale}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <ControlRow
            label="Position"
            value={faceY}
            min={FACE_Y_MIN}
            max={FACE_Y_MAX}
            step={FACE_Y_STEP}
            onChange={setFaceY}
            formatValue={(v) => `${v > 0 ? '+' : ''}${v}px`}
          />
        </div>
        <p className="mt-2 truncate text-center font-playfair text-xs text-white/70">
          {product?.name}
        </p>
      </div>
    </div>
  );
}
