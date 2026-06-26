'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTiltParallax } from '@/features/landing/hooks/useTiltParallax';
import {
  HERO_EDITORIAL_IMAGE,
  LANDING_STATS,
} from '@/features/landing/constants/landingData';

export function LandingHero() {
  const tilt = useTiltParallax({ maxTilt: 14, scale: 1.03 });

  return (
    <section className="relative grid min-h-screen grid-cols-1 items-center gap-12 px-4 pb-16 pt-28 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-12 lg:pt-24">
      <div className="mx-auto max-w-xl space-y-8 lg:mx-0 lg:max-w-none lg:py-12">
        <div
          className={cn(
            'landing-badge-glow inline-flex items-center gap-2 rounded-full border border-violet/50',
            'bg-white/5 dark:bg-[#150d22]/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-violet',
            'animate-pop-in opacity-0',
          )}
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-magenta" />
          Powered by generative AI
        </div>

        <h1
          className="font-playfair text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl animate-pop-in opacity-0"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          Your wardrobe,{' '}
          <span className="font-bold italic text-magenta">reimagined</span> by AI.
        </h1>

        <p
          className="max-w-lg text-base leading-relaxed text-slate-600 dark:text-gray-400 sm:text-lg animate-pop-in opacity-0"
          style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
        >
          Describe any occasion — rooftop dinner, boardroom pitch, weekend escape — and watch AI
          generate complete, photorealistic outfits tailored to your body, taste, and closet.
        </p>

        <div
          className="flex flex-wrap items-center gap-4 animate-pop-in opacity-0"
          style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
        >
          <Link
            href="/register/face"
            className="landing-btn-glow inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            Start Styling Free
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-borderColor bg-white/5 dark:bg-[#150d22]/5 px-6 py-3.5 text-sm font-medium text-slate-800 dark:text-white/90 transition-all duration-300 hover:border-violet/50 hover:bg-slate-100/50 dark:hover:bg-white/5"
          >
            <Play className="h-4 w-4 fill-current" />
            Watch Demo
          </a>
        </div>

        <div
          className="flex flex-wrap gap-8 border-t border-borderColor pt-8 animate-pop-in opacity-0"
          style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}
        >
          {LANDING_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-playfair text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative mx-auto w-full max-w-lg lg:max-w-none animate-pop-in opacity-0"
        style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-borderColor shadow-2xl shadow-violet/20">
          <Image
            src={HERO_EDITORIAL_IMAGE}
            alt="Editorial fashion portrait"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover grayscale"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/30 via-transparent to-violet/10" />
        </div>

        <div
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          onMouseEnter={tilt.onMouseEnter}
          className={cn(
            'absolute -bottom-6 -left-4 z-10 w-[min(100%,280px)] rounded-xl border border-borderColor',
            'bg-white dark:bg-[#150d22]-dark/95 p-4 shadow-2xl backdrop-blur-xl sm:-left-8',
            'animate-float-subtle',
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-magenta">
            AI Suggestion
          </p>
          <p className="mt-2 font-playfair text-lg font-semibold italic leading-snug text-slate-900 dark:text-white">
            Monochrome Power Look
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-gray-400">
            Structured blazer · wide-leg trouser · pointed heel · 97% style match
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5 dark:bg-[#150d22]/5">
              <span className="block h-full w-[97%] rounded-full bg-gradient-to-r from-magenta to-violet" />
            </span>
            <span className="font-mono text-[10px] text-magenta">97%</span>
          </div>
        </div>

        <div
          className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-magenta/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 right-8 h-32 w-32 rounded-full bg-violet/25 blur-3xl"
          aria-hidden
        />
      </div>
    </section>
  );
}
