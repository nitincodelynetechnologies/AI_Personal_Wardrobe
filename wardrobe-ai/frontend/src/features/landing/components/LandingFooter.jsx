'use client';

import Link from 'next/link';
import { LANDING_NAV_LINKS } from '@/features/landing/constants/landingData';

export function LandingFooter() {
  return (
    <footer className="border-t border-borderColor px-4 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">✨ AI WARDROBE</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-500">
            © {new Date().getFullYear()} AI Personal Wardrobe. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-6">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login/face"
            className="text-sm text-slate-600 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </footer>
  );
}
