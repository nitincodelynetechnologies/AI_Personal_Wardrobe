'use client';

import { LandingNav } from '@/features/landing/components/LandingNav';
import { LandingHero } from '@/features/landing/components/LandingHero';
import { LandingFeatures } from '@/features/landing/components/LandingFeatures';
import { LandingHowItWorks } from '@/features/landing/components/LandingHowItWorks';
import { LandingGallery } from '@/features/landing/components/LandingGallery';
import { LandingTestimonials } from '@/features/landing/components/LandingTestimonials';
import { LandingCta } from '@/features/landing/components/LandingCta';
import { LandingFooter } from '@/features/landing/components/LandingFooter';

export function LandingPage() {
  return (
    <div className="landing-page overflow-x-hidden">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingGallery />
        <LandingTestimonials />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
