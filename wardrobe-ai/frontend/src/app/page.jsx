import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 overflow-x-hidden px-4">
      <div className="max-w-xl space-y-4 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-champagne">
          AI Personal Wardrobe
        </p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Virtual Fashion, <span className="text-gradient-gold">Personalized</span>
        </h1>
        <p className="text-muted-foreground">
          Begin by registering your face to unlock your secure biometric styling profile.
        </p>
      </div>
      <Button asChild size="lg" className="min-w-[220px]">
        <Link href="/register/face">Start Face Registration</Link>
      </Button>
    </div>
  );
}
