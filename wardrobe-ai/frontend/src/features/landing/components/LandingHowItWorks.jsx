'use client';

import { LANDING_STEPS } from '@/features/landing/constants/landingData';

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden px-4 py-24 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-violet/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
            How It Works
          </p>
          <h2 className="mt-4 font-playfair text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Three steps to your{' '}
            <span className="italic text-magenta">signature style.</span>
          </h2>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-3 lg:gap-8">
          {LANDING_STEPS.map((item, index) => (
            <div
              key={item.step}
              className="relative animate-pop-in opacity-0"
              style={{
                animationDelay: `${0.15 + index * 0.12}s`,
                animationFillMode: 'forwards',
              }}
            >
              <span
                className="pointer-events-none absolute -left-2 -top-8 font-playfair text-[8rem] font-bold leading-none text-slate-900 dark:text-white/[0.04] sm:text-[9rem] lg:-top-12"
                aria-hidden
              >
                {item.step}
              </span>

              <div className="relative pt-8 lg:pt-12">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-magenta">
                  Step {item.step}
                </p>
                <h3 className="mt-3 font-playfair text-2xl font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-gray-400 sm:text-base">
                  {item.description}
                </p>
              </div>

              {index < LANDING_STEPS.length - 1 && (
                <div
                  className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-violet/50 to-transparent lg:block"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
