'use client';

import {
  Grid3X3,
  MessageCircle,
  ScanFace,
  Sparkles,
  Wand2,
  Dna,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANDING_FEATURES } from '@/features/landing/constants/landingData';

const ICON_MAP = {
  sparkles: Sparkles,
  scan: ScanFace,
  wand: Wand2,
  dna: Dna,
  grid: Grid3X3,
  message: MessageCircle,
};

export function LandingFeatures() {
  return (
    <section id="features" className="relative px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-magenta">
            Platform Features
          </p>
          <h2 className="mt-4 font-playfair text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Intelligence woven into every{' '}
            <span className="italic text-slate-800 dark:text-white/90">outfit decision.</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-gray-400 sm:text-lg">
            Six AI-powered capabilities that transform how you discover, try, and wear fashion.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] ?? Sparkles;

            return (
              <article
                key={feature.id}
                className={cn(
                  'landing-card-3d group rounded-2xl border border-borderColor bg-white dark:bg-[#150d22]-dark p-7',
                  'transition-all duration-300 hover:-translate-y-2',
                  'hover:border-violet/50 hover:shadow-[0_10px_40px_-10px_rgba(233,30,140,0.5)]',
                  'animate-pop-in opacity-0',
                )}
                style={{
                  animationDelay: `${0.1 + index * 0.08}s`,
                  animationFillMode: 'forwards',
                }}
              >
                <div
                  className={cn(
                    'mb-5 flex h-12 w-12 items-center justify-center rounded-xl',
                    'bg-gradient-to-br from-magenta/30 to-violet/30 text-magenta',
                    'ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-gray-400">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
