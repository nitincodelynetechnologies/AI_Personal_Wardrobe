'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANDING_TESTIMONIALS } from '@/features/landing/constants/landingData';

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-magenta text-magenta" />
      ))}
    </div>
  );
}

export function LandingTestimonials() {
  return (
    <section className="px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
            Testimonials
          </p>
          <h2 className="mt-4 font-playfair text-3xl font-semibold sm:text-4xl">
            Loved by style-conscious{' '}
            <span className="italic text-magenta">creators worldwide.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {LANDING_TESTIMONIALS.map((item, index) => (
            <blockquote
              key={item.id}
              className={cn(
                'landing-card-3d rounded-2xl border border-borderColor bg-white dark:bg-[#150d22]-dark p-7',
                'transition-all duration-300 hover:-translate-y-2',
                'hover:border-violet/40 hover:shadow-[0_10px_40px_-10px_rgba(124,58,237,0.4)]',
                'animate-pop-in opacity-0',
              )}
              style={{
                animationDelay: `${0.1 + index * 0.1}s`,
                animationFillMode: 'forwards',
              }}
            >
              <StarRating count={item.rating} />
              <p className="mt-5 font-playfair text-lg italic leading-relaxed text-slate-800 dark:text-white/90">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 border-t border-borderColor pt-5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-500">
                  {item.role}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
