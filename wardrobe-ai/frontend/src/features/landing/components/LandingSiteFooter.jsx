import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact', href: '#' },
];

export function LandingSiteFooter() {
  return (
    <footer className="border-t border-borderColor bg-slate-50 px-4 py-12 dark:border-slate-700/50 dark:bg-slate-950/50 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="#" className="inline-flex items-center gap-2 font-playfair text-lg font-semibold text-slate-900 dark:text-slate-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/25">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              AI Wardrobe
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Your AI-powered personal wardrobe and virtual fashion platform. Curate your style,
              elevate your wardrobe.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-magenta dark:text-slate-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-borderColor pt-8 dark:border-slate-700/50 sm:flex-row">
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} AI Wardrobe. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access the full experience
          </p>
        </div>
      </div>
    </footer>
  );
}
