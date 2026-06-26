import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  MessageCircle,
  ScanFace,
  Shirt,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200&sat=-100';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Style Generator',
    description:
      'Describe any occasion and receive complete, photorealistic outfits tailored to your taste in seconds.',
  },
  {
    icon: Camera,
    title: 'Virtual Try-On',
    description:
      'See every garment on your body in 3D before you buy — powered by generative AI rendering.',
  },
  {
    icon: ScanFace,
    title: 'Face-Verified Profile',
    description:
      'Biometric login unlocks a wardrobe calibrated to your unique facial geometry and style DNA.',
  },
  {
    icon: Sparkles,
    title: 'Fashion DNA Analysis',
    description:
      'Deep intelligence maps your color affinity, body type, and aesthetic preferences automatically.',
  },
  {
    icon: Shirt,
    title: 'Smart Catalog',
    description:
      'Premium labels ranked by your profile — every recommendation feels impossibly personal.',
  },
  {
    icon: MessageCircle,
    title: 'AI Stylist Chat',
    description:
      '24/7 conversational styling advice from a fashion-trained AI that knows your entire closet.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-slate-900 dark:text-white">
      {/* ── Glassmorphic Navigation ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-borderColor bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-[4.5rem] sm:px-8">
          <Link href="/" className="font-mono text-sm font-medium tracking-widest text-slate-900 dark:text-white">
            ✨ AI WARDROBE
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:text-white">
              Features
            </a>
            <a href="#hero" className="text-sm text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:text-white">
              How It Works
            </a>
            <Link href="/login/face" className="text-sm text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:text-white">
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/register/face"
              className="rounded-full bg-magenta px-6 py-2 font-bold text-white transition-all hover:bg-magenta/80"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Split Canvas Hero ── */}
      <section
        id="hero"
        className="grid min-h-screen grid-cols-1 items-center gap-12 px-6 pt-24 lg:grid-cols-2 lg:gap-16 lg:px-12"
      >
        {/* Left */}
        <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-none">
          <div className="mb-6 w-fit rounded-full border border-violet/50 px-4 py-1 text-sm text-violet shadow-[0_0_20px_rgba(124,58,237,0.35)]">
            Powered by generative AI
          </div>

          <h1 className="font-playfair text-6xl font-bold leading-tight md:text-8xl">
            Your wardrobe, <br />
            <span className="italic text-magenta">reimagined</span> by AI.
          </h1>

          <p className="mt-6 font-sans text-lg text-slate-700 dark:text-gray-400">
            Describe any occasion — rooftop dinner, boardroom pitch, weekend escape — and watch AI
            generate complete outfits tailored to your body, taste, and closet.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register/face"
              className="btn-magenta btn-magenta-glow rounded-full px-8 py-3.5 text-sm"
            >
              Start Styling Free
            </Link>
            <a
              href="#features"
              className="rounded-full border border-borderColor px-8 py-3.5 text-sm font-medium text-slate-900 dark:text-white transition-all hover:border-violet/50 hover:bg-slate-100/90 dark:hover:bg-[#150d22]/80"
            >
              Watch Demo
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-10 border-t border-borderColor pt-10">
            <div>
              <p className="font-playfair text-3xl font-bold">12k+</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-700 dark:text-gray-400">
                Wardrobes styled
              </p>
            </div>
            <div>
              <p className="font-playfair text-3xl font-bold">98%</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-700 dark:text-gray-400">
                Match accuracy
              </p>
            </div>
            <div>
              <p className="font-playfair text-3xl font-bold">4.9★</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-700 dark:text-gray-400">
                App rating
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-borderColor shadow-2xl shadow-violet/20">
            <Image
              src={HERO_IMAGE}
              alt="High-fashion editorial portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/20" />
          </div>

          {/* Glassmorphic overlay card */}
          <div className="absolute -bottom-4 -left-4 max-w-[280px] rounded-2xl border border-borderColor bg-white/90 dark:bg-[#150d22]/90 p-5 shadow-2xl backdrop-blur-xl sm:-left-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">
              AI Suggestion
            </p>
            <p className="mt-2 font-playfair text-lg font-semibold italic text-slate-900 dark:text-white">
              Monochrome Power Look
            </p>
            <p className="mt-2 text-xs text-slate-700 dark:text-gray-400">
              Structured blazer · wide-leg trouser · pointed heel
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-magenta" />
              <span className="h-2.5 w-2.5 rounded-full bg-violet" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/40 dark:bg-[#150d22]/40" />
              <span className="ml-auto font-mono text-xs text-magenta">97% match</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 font-playfair text-5xl font-bold leading-tight">
            Intelligence woven into every{' '}
            <span className="italic text-magenta">outfit decision.</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-borderColor bg-white dark:bg-[#150d22] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-violet/50 hover:shadow-[0_10px_40px_-10px_rgba(233,30,140,0.4)]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-magenta/30 to-violet/30 text-magenta">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-slate-700 dark:text-gray-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="relative px-6 py-24 lg:px-12">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-80 w-full max-w-2xl rounded-full bg-gradient-to-r from-violet/20 via-magenta/15 to-violet/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-playfair text-4xl font-bold md:text-5xl">
            Ready to <span className="italic text-magenta">transform</span> your wardrobe?
          </h2>
          <p className="mt-4 font-sans text-slate-700 dark:text-gray-400">
            Join thousands styling smarter with AI. Free during beta.
          </p>
          <Link
            href="/register/face"
            className="btn-magenta btn-magenta-glow mt-8 inline-block rounded-full px-10 py-4 text-sm"
          >
            Start Styling Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-borderColor px-6 py-8 text-center">
        <p className="font-mono text-xs text-slate-700 dark:text-gray-400">
          © {new Date().getFullYear()} AI Wardrobe · Soft Ice Blue & Deep Obsidian
        </p>
      </footer>
    </div>
  );
}
