'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  ChevronRight,
  MessageCircle,
  ScanFace,
  Search,
  Shirt,
  Sparkles,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuthGuard } from '@/features/auth/hooks/useAuthGuard';
import {
  GUEST_CATEGORY_CIRCLES,
  GUEST_NAV_LINKS,
  HERO_SLIDES,
  LANDING_FEATURE_GRID,
} from '@/features/landing/constants/guestLandingData';
import { buildCatalogSearchPath } from '@/features/catalog/services/catalogService';
import { LandingPricingSection } from '@/features/landing/components/LandingPricingSection';
import { LandingSiteFooter } from '@/features/landing/components/LandingSiteFooter';

const SLIDE_INTERVAL_MS = 5500;

const FEATURE_ICONS = {
  stylist: MessageCircle,
  'face-studio': ScanFace,
  catalog: Sparkles,
  wardrobe: Warehouse,
  closet: Shirt,
  wishlist: Bookmark,
};

function AuthInterceptButton({ children, className, mode = 'login', onAuth, ...props }) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => onAuth(event, mode)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GuestLandingPage() {
  const router = useRouter();
  const { ready, isAuthenticated, interceptAuth, promptAuth } = useAuthGuard();
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!ready) return undefined;
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
    return undefined;
  }, [ready, isAuthenticated, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const runCatalogSearch = useCallback(() => {
    router.push(buildCatalogSearchPath(searchQuery));
  }, [router, searchQuery]);

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      runCatalogSearch();
    },
    [runCatalogSearch],
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runCatalogSearch();
      }
    },
    [runCatalogSearch],
  );

  if (!ready) {
    return (
      <div className="midnight-shell flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-magenta border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const slide = HERO_SLIDES[activeSlide];

  return (
    <div className="midnight-shell min-h-screen bg-background text-slate-900 dark:text-slate-200">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-borderColor bg-background/85 backdrop-blur-xl dark:border-slate-700/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem] sm:gap-6 sm:px-8">
          <AuthInterceptButton
            onAuth={interceptAuth}
            className="flex shrink-0 items-center gap-2 font-playfair text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/25">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">AI Wardrobe</span>
          </AuthInterceptButton>

          <nav className="hidden items-center gap-6 md:flex">
            {GUEST_NAV_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.id === 'shop' ? '/catalog' : '#'}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-magenta dark:text-slate-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearchSubmit} className="mx-auto hidden max-w-md flex-1 lg:flex">
            <div className="relative w-full">
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-magenta"
                aria-label="Search catalog"
              >
                <Search className="h-4 w-4" aria-hidden />
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search styles, brands, occasions…"
                className="w-full rounded-full border border-borderColor bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-magenta focus:ring-2 focus:ring-magenta/20 dark:bg-slate-900/60 dark:text-slate-100"
                aria-label="Search catalog"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="header" />
            <AuthInterceptButton
              onAuth={interceptAuth}
              mode="login"
              className="hidden rounded-full border border-borderColor px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-magenta/40 dark:text-slate-200 sm:inline-flex"
            >
              Sign In
            </AuthInterceptButton>
            <AuthInterceptButton
              onAuth={interceptAuth}
              mode="register"
              className="rounded-full bg-magenta px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(233,30,140,0.25)] transition-all hover:bg-magenta/90 sm:px-6"
            >
              Register
            </AuthInterceptButton>
          </div>
        </div>
      </header>

      {/* ── Hero carousel ── */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[min(88vh,720px)]">
          {HERO_SLIDES.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-out',
                index === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={index !== activeSlide}
            >
              <Image
                src={item.image}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/20 dark:from-black/90 dark:via-black/65" />
            </div>
          ))}

          <div className="relative z-10 mx-auto flex min-h-[min(88vh,720px)] max-w-7xl flex-col justify-center px-6 py-20 sm:px-8">
            <p className="mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
              New Season · AI Powered
            </p>
            <h1 className="max-w-3xl font-playfair text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {slide.headline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {slide.subline}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/catalog"
                className="btn-magenta inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
              >
                {slide.cta}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <AuthInterceptButton
                onAuth={interceptAuth}
                className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Virtual Try-On
              </AuthInterceptButton>
            </div>

            <div className="mt-12 flex items-center gap-2">
              {HERO_SLIDES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === activeSlide ? 'w-8 bg-magenta' : 'w-3 bg-white/40 hover:bg-white/70',
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category circles ── */}
      <section className="border-b border-borderColor bg-background px-4 py-12 dark:border-slate-700/50 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magenta">Shop by Style</p>
              <h2 className="mt-2 font-playfair text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Curated Categories
              </h2>
            </div>
            <Link
              href="/catalog"
              className="hidden text-sm font-semibold text-magenta sm:inline-flex"
            >
              View all
            </Link>
          </div>

          <div className="scrollbar-hide -mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
            {GUEST_CATEGORY_CIRCLES.map((category) => (
              <Link
                key={category.id}
                href="/catalog"
                className="group flex w-[5.5rem] shrink-0 flex-col items-center gap-3 sm:w-24"
              >
                <span className="relative block h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full border-2 border-borderColor shadow-lg ring-2 ring-transparent transition-all group-hover:border-magenta/50 group-hover:ring-magenta/20 sm:h-24 sm:w-24">
                  <Image
                    src={category.image}
                    alt={category.label}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium feature grid ── */}
      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magenta">The Portal</p>
          <h2 className="mt-2 font-playfair text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Everything you need to dress smarter
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Guests can browse the catalog — sign in to unlock AI styling, wardrobe tools, and checkout.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_FEATURE_GRID.map((feature) => {
              const Icon = FEATURE_ICONS[feature.id] ?? Sparkles;
              const cardClass =
                'midnight-surface group flex h-full flex-col rounded-2xl border border-borderColor bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:border-magenta/30 dark:bg-slate-800/80';

              const inner = (
                <>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-magenta/20 to-violet/20 text-magenta ring-1 ring-magenta/20 transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-magenta">
                    {feature.browseFree ? 'Browse Free' : 'Members'}
                  </p>
                  <h3 className="mt-2 font-playfair text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-magenta">
                    {feature.href ? 'Explore' : 'Sign in to unlock'}
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </>
              );

              if (feature.href) {
                return (
                  <Link key={feature.id} href={feature.href} className={cardClass}>
                    {inner}
                  </Link>
                );
              }

              return (
                <AuthInterceptButton key={feature.id} onAuth={interceptAuth} className={cardClass}>
                  {inner}
                </AuthInterceptButton>
              );
            })}
          </div>
        </div>
      </section>

      <LandingPricingSection />
      <LandingSiteFooter />
    </div>
  );
}
