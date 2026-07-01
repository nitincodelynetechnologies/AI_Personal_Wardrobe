'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function GuestCatalogShell({ children }) {
  return (
    <div className="midnight-shell flex min-h-screen flex-col bg-background text-slate-900 dark:text-slate-200">
      <header className="sticky top-0 z-50 border-b border-borderColor bg-background/90 backdrop-blur-xl dark:border-slate-700/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-playfair text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/25">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">AI Wardrobe</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="header" />
            <Link
              href="/login/face"
              className="rounded-full border border-borderColor px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-magenta/40 dark:text-slate-200"
            >
              Sign In
            </Link>
            <Link
              href="/register/face"
              className="rounded-full bg-magenta px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(233,30,140,0.25)] transition-all hover:bg-magenta/90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
