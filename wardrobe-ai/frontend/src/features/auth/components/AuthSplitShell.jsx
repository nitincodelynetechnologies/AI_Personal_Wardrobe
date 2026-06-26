'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const WARDROBE_IMAGE =
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop';

export const AUTH_FORM_CARD =
  'bg-white dark:bg-[#150d22] p-10 sm:p-12 rounded-3xl shadow-md border border-borderColor w-full max-w-md mx-auto';

export const AUTH_MINIMAL_INPUT =
  'w-full bg-white dark:bg-[#150d22] border border-borderColor text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:border-magenta focus:ring-2 focus:ring-[#e91e8c]/15 outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-gray-400';

export const AUTH_PRIMARY_BUTTON =
  'bg-magenta text-white w-full py-4 rounded-md font-semibold hover:bg-magenta/80 transition-colors tracking-wide disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2';

export const AUTH_SECONDARY_BUTTON =
  'w-full py-4 rounded-md border border-borderColor text-slate-700 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#1a1028] flex items-center justify-center gap-2 transition-all';

function AuthHeroPanel() {
  return (
    <div className="relative hidden h-full min-h-[280px] w-full lg:block">
      <Image
        src={WARDROBE_IMAGE}
        alt="Virtual Wardrobe"
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-violet/20 to-transparent" />
      <div className="absolute bottom-12 left-12 right-12 z-10">
        <h2 className="font-playfair text-4xl font-bold tracking-wide text-white">
          Virtual Fashion Studio
        </h2>
        <p className="mt-2 text-lg text-gray-200">Curate your style. Elevate your wardrobe.</p>
      </div>
    </div>
  );
}

function AuthMobileHeader() {
  return (
    <div className="mb-8 w-full max-w-md text-center lg:hidden">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-magenta">
        AI Wardrobe
      </p>
      <h2 className="mt-2 font-playfair text-2xl font-bold text-slate-900 dark:text-white">Virtual Fashion Studio</h2>
      <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">Curate your style. Elevate your wardrobe.</p>
    </div>
  );
}

export function AuthSplitShell({ children, variant = 'login' }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <AuthHeroPanel />

        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-8 lg:px-16">
          <AuthMobileHeader />
          <div className="w-full max-w-md">{children}</div>

          <p className="mt-8 w-full max-w-md text-center text-xs text-slate-700 dark:text-gray-400">
            {variant === 'register' ? (
              <>
                Already have an account?{' '}
                <Link
                  href="/login/face"
                  className="font-medium text-magenta underline underline-offset-4 hover:text-[#c4186f]"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{' '}
                <Link
                  href="/register/face"
                  className="font-medium text-magenta underline underline-offset-4 hover:text-[#c4186f]"
                >
                  Create account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
