'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Sparkles } from 'lucide-react';
import { formatLabel } from '@/features/dashboard/utils/dashboardUtils';
import { HERO_EDITORIAL_IMAGES } from '@/features/recommendations/constants/recommendationCatalog';

function formatColorAffinity(colors = []) {
  if (!colors.length) return 'Cool Neutrals';

  const joined = colors.slice(0, 2).map((color) => formatLabel(color)).join(' & ');
  return joined || 'Cool Neutrals';
}

export function PersonalizedHero({
  displayName,
  bodyType,
  fashionStyle,
  preferredColors,
  onGenerateLook,
  onTryOn,
}) {
  const firstName = displayName?.split(/[.@\s]/)[0] || 'Stylist';
  const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const chips = [
    { label: 'Body Type', value: `${formatLabel(bodyType)} V` },
    { label: 'Style Journey', value: formatLabel(fashionStyle) || 'Contemporary' },
    { label: 'Colour Affinity', value: formatColorAffinity(preferredColors) },
    { label: 'Mood Upgrade', value: 'Elevated Casual' },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-white/5 dark:shadow-none">
      <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f8] via-[#fcf5ff] to-[#f5f7ff] dark:from-[#150d22] dark:via-[#150d22] dark:to-[#0a0612]" />

      <div className="absolute inset-0 hidden grid-cols-3 sm:grid">
        {HERO_EDITORIAL_IMAGES.slice(0, 3).map((src, index) => (
          <div key={src} className="relative min-h-[340px]">
            <Image
              src={src}
              alt=""
              fill
              sizes="33vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 sm:hidden">
        <Image
          src={HERO_EDITORIAL_IMAGES[0]}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/80 to-white/55 dark:from-black/80 dark:via-black/80 dark:to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent dark:from-obsidian dark:via-obsidian/30 dark:to-magenta/10" />

      <div className="relative flex min-h-[340px] flex-col justify-end px-6 py-8 sm:min-h-[380px] sm:px-10 sm:py-10">
        <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-magenta px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(233,30,140,0.4)]">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI Style Ready
        </span>

        <h1 className="max-w-3xl font-playfair text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
          Welcome back,{' '}
          <span className="text-magenta">{formattedName}.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Your personalised style curation is ready.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:shadow-none"
            >
              {chip.label}: {chip.value}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/outfits"
            onClick={onGenerateLook}
            className="inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-[0_0_24px_rgba(233,30,140,0.45)] transition-all hover:bg-magenta/90"
          >
            <Sparkles className="h-4 w-4" />
            Generate Today&apos;s Look
          </Link>
          <button
            type="button"
            onClick={onTryOn}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-700 shadow-sm transition-colors hover:border-magenta/40 hover:text-magenta dark:border-white/20 dark:bg-[#1a1025]/80 dark:text-white dark:shadow-none dark:backdrop-blur-sm dark:hover:text-magenta"
          >
            <Eye className="h-4 w-4" />
            Virtual Try-On
          </button>
        </div>
      </div>
    </section>
  );
}
