'use client';

const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=85&auto=format&fit=crop',
    alt: 'High fashion editorial portrait',
    caption: 'Curated by AI',
  },
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a712f554?w=1400&q=85&auto=format&fit=crop',
    alt: 'Luxury fashion studio',
    caption: 'Your Virtual Atelier',
  },
  {
    src: 'https://images.unsplash.com/photo-1483985988355-763728e40ca5?w=1400&q=85&auto=format&fit=crop',
    alt: 'Premium street style',
    caption: 'Style Without Limits',
  },
];

export function AuthVisualPanel({ variant = 'login' }) {
  const headline = variant === 'register' ? 'Join the Studio' : 'Virtual Fashion Studio';
  const subline =
    variant === 'register'
      ? 'Register your look. Let AI curate your wardrobe.'
      : 'Premium AI styling. Face-secure access. Effortless elegance.';

  return (
    <div
      className="relative hidden min-h-[40vh] overflow-hidden lg:block lg:min-h-[100dvh]"
      aria-hidden="true"
    >
      {HERO_IMAGES.map((image, index) => (
        <div
          key={image.src}
          className="auth-hero-slide absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image.src})`,
            animationDelay: `${index * 6}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-noir/90 via-noir/30 to-transparent" />
      <div className="absolute inset-0 fashion-gradient opacity-30 mix-blend-soft-light" />

      <div className="relative flex h-full flex-col justify-end p-10 xl:p-14">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-violet/90 animate-fade-up">
          AI Personal Wardrobe
        </p>
        <h2 className="max-w-md font-playfair text-4xl font-semibold leading-tight text-slate-900 dark:text-white animate-fade-up xl:text-5xl">
          {headline}
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-700 dark:text-gray-400 animate-fade-up">{subline}</p>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-12 bg-violet/60" />
          <p className="text-xs uppercase tracking-[0.25em] text-violet/80">{HERO_IMAGES[0].caption}</p>
        </div>
      </div>
    </div>
  );
}
