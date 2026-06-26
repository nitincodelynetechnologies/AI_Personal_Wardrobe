'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useToastStore } from '@/components/ui/toaster';

export function LandingCta() {
  const showToast = useToastStore((state) => state.showToast);
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    showToast({
      message: "You're on the list! We'll be in touch soon.",
      variant: 'success',
    });
    setEmail('');
  };

  return (
    <section id="cta" className="relative px-4 py-28 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[420px] w-[min(100%,720px)] rounded-full bg-gradient-to-r from-violet/25 via-magenta/20 to-violet/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-borderColor bg-white/5 dark:bg-[#150d22]/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-magenta">
          <Sparkles className="h-3.5 w-3.5" />
          Early Access
        </div>

        <h2 className="mt-6 font-playfair text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The future of fashion is{' '}
          <span className="italic text-magenta">personal.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 dark:text-gray-400 sm:text-lg">
          Join thousands on the waitlist for priority access to AI styling, virtual try-on, and
          your biometric fashion profile.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            required
            className="min-w-0 flex-1 rounded-full border border-borderColor bg-white dark:bg-[#150d22]-dark px-5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-500 dark:text-gray-500 focus:border-violet/60 focus:ring-2 focus:ring-violet/20"
          />
          <button
            type="submit"
            className="landing-btn-glow inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold whitespace-nowrap"
          >
            Join the Waitlist
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-500">
          No spam · Free during beta · Cancel anytime
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register/face"
            className="text-sm text-slate-600 dark:text-gray-400 underline-offset-4 transition-colors hover:text-magenta hover:underline"
          >
            Start styling free instead →
          </Link>
        </div>
      </div>
    </section>
  );
}
