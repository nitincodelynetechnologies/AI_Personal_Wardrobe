import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for exploring AI styling at your own pace.',
    features: [
      'Browse the fashion catalog',
      'Basic outfit suggestions',
      'Limited wardrobe slots',
      'Community style inspiration',
    ],
    cta: 'Choose Plan',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'Our most popular plan for everyday style upgrades.',
    features: [
      'Everything in Free',
      'AI stylist chat unlimited',
      'Virtual try-on sessions',
      'Digital wardrobe management',
      'Priority outfit recommendations',
    ],
    cta: 'Subscribe',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$24',
    period: '/month',
    description: 'The complete virtual fashion studio experience.',
    features: [
      'Everything in Pro',
      'Face studio & biometric login',
      'Advanced fashion DNA insights',
      'Exclusive catalog drops',
      'Early access to new AI features',
    ],
    cta: 'Choose Plan',
    highlighted: false,
  },
];

export function LandingPricingSection() {
  return (
    <section className="border-t border-borderColor bg-background px-4 py-16 dark:border-slate-700/50 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magenta">Pricing</p>
          <h2 className="mt-2 font-playfair text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Plans for every wardrobe
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Start free and upgrade when you&apos;re ready for the full AI-powered fashion experience.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6 shadow-lg transition-all sm:p-8',
                tier.highlighted
                  ? 'border-magenta/50 bg-gradient-to-b from-magenta/10 to-violet/5 ring-2 ring-magenta/30 dark:from-magenta/15 dark:to-slate-900/80'
                  : 'border-borderColor bg-white dark:bg-slate-800/80',
              )}
            >
              {tier.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-magenta px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_20px_rgba(233,30,140,0.35)]">
                  {tier.badge}
                </span>
              ) : null}

              <div>
                <h3 className="font-playfair text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{tier.description}</p>
              </div>

              <div className="mt-6 flex items-end gap-1">
                <span className="font-playfair text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {tier.price}
                </span>
                <span className="mb-1 text-sm text-slate-500 dark:text-slate-400">{tier.period}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-magenta/15 text-magenta">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="#"
                className={cn(
                  'mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition-all',
                  tier.highlighted
                    ? 'bg-magenta text-white shadow-[0_0_20px_rgba(233,30,140,0.25)] hover:bg-magenta/90'
                    : 'border border-borderColor bg-white text-slate-900 hover:border-magenta/40 dark:bg-slate-900/60 dark:text-slate-100',
                )}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
