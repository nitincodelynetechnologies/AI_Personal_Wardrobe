'use client';

import Link from 'next/link';
import { ScanFace, Sparkles, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthRequiredOverlay({ className }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md dark:bg-black/55',
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      <div className="midnight-surface w-full max-w-lg rounded-3xl border border-borderColor bg-white/95 p-8 text-center shadow-2xl dark:bg-slate-800/90 sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-magenta/20 to-violet/20 text-magenta ring-1 ring-magenta/30">
          <ScanFace className="h-8 w-8" aria-hidden />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-magenta">Members Only</p>
        <h2
          id="auth-required-title"
          className="mt-3 font-playfair text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl"
        >
          🔐 Premium Access Only
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Please sign in or register your face profile to view our full collection and use the AI
          Virtual Fitting Room.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login/face"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-bold text-white transition-all hover:bg-magenta/90 hover:shadow-[0_0_24px_rgba(233,30,140,0.35)]"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Sign In
          </Link>
          <Link
            href="/register/face"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-borderColor bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-all hover:border-magenta/40 dark:bg-slate-900/80 dark:text-slate-100"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Register Face Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
