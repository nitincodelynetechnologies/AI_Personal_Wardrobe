'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LANDING_NAV_LINKS } from '@/features/landing/constants/landingData';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'landing-glass shadow-lg shadow-black/10 dark:shadow-black/20' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-8">
        <Link
          href="/"
          className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-900 dark:text-white sm:text-sm"
        >
          ✨ AI WARDROBE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login/face"
            className="text-sm font-medium text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/register/face"
            className="landing-btn-glow rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Get Early Access
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-900 dark:text-white"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="landing-glass border-t border-borderColor px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm text-slate-700 dark:text-gray-400"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login/face"
              className="py-2 text-sm text-slate-700 dark:text-gray-400"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/register/face"
              className="landing-btn-glow mt-2 rounded-full px-5 py-3 text-center text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Get Early Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
