'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_GALLERY_ITEMS,
  LANDING_GALLERY_TABS,
} from '@/features/landing/constants/landingData';

export function LandingGallery() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    if (activeTab === 'All') return LANDING_GALLERY_ITEMS;
    return LANDING_GALLERY_ITEMS.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <section id="gallery" className="px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-magenta">
              Style Gallery
            </p>
            <h2 className="mt-4 font-playfair text-3xl font-semibold sm:text-4xl">
              Curated looks,{' '}
              <span className="italic text-slate-800 dark:text-slate-700 dark:text-gray-300">ready to try on.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {LANDING_GALLERY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-300',
                  activeTab === tab
                    ? 'bg-magenta text-white shadow-lg shadow-magenta/30'
                    : 'border border-borderColor bg-white/5 dark:bg-[#150d22]/5 text-slate-600 dark:text-gray-400 hover:border-violet/40 hover:text-slate-900 dark:hover:text-white',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4 lg:gap-5">
          {filtered.map((item, index) => (
            <article
              key={item.id}
              className={cn(
                'group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-borderColor',
                'animate-pop-in opacity-0',
                item.tall ? 'aspect-[3/4]' : 'aspect-[4/5]',
              )}
              style={{
                animationDelay: `${0.05 + index * 0.06}s`,
                animationFillMode: 'forwards',
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-magenta">
                  {item.category}
                </p>
                <p className="mt-1 font-playfair text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
              </div>

              <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 ease-out group-hover:translate-y-0">
                <Link
                  href="/register/face"
                  className="landing-btn-glow flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-wider"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Try On
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
