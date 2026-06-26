'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadialScore } from '@/features/dashboard/components/RadialScore';
import {
  COLOR_HEX_MAP,
  formatLabel,
  getPrimaryStyle,
  getTopAffinities,
} from '@/features/dashboard/utils/dashboardUtils';

export function FashionDNACard({ fashionDna, preferences }) {
  const primaryStyle = getPrimaryStyle(fashionDna, preferences);
  const colorAffinities = getTopAffinities(fashionDna?.color_affinity);
  const brandAffinities = getTopAffinities(fashionDna?.brand_affinity, 3);
  const isMissing = !fashionDna;

  if (isMissing) {
    return (
      <Card className="border-dashed border-violet/30 bg-white/40 dark:bg-[#150d22]/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair">
            <Sparkles className="h-5 w-5 text-violet" />
            Fashion DNA
          </CardTitle>
          <CardDescription>
            Your style profile is still being calculated. Complete onboarding to generate it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/onboarding">Complete Onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-view stagger-1 border-borderColor bg-gradient-to-br from-surface/90 to-noir-surface/50 shadow-xl shadow-black/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-playfair text-xl">
          <Sparkles className="h-5 w-5 text-violet" />
          Fashion DNA
        </CardTitle>
        <CardDescription>
          AI-generated style fingerprint based on your preferences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border border-violet/20 bg-violet/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-violet/80">Primary Style</p>
          <p className="font-playfair text-2xl font-semibold text-gradient-gold">
            {formatLabel(primaryStyle)}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-borderColor p-4">
            <RadialScore value={fashionDna.style_score} label="Style" />
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-borderColor p-4">
            <RadialScore value={fashionDna.lifestyle_score} label="Lifestyle" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Color Affinity
          </p>
          {colorAffinities.length ? (
            colorAffinities.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 capitalize">
                    <span
                      className="h-3 w-3 rounded-full border border-borderColor"
                      style={{ backgroundColor: COLOR_HEX_MAP[item.name] || '#888' }}
                    />
                    {item.name}
                  </span>
                  <span className="text-violet">{item.score}%</span>
                </div>
                <Progress value={item.score} className="h-1.5" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No color affinity data yet.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Brand Affinity
          </p>
          <div className="flex flex-wrap gap-2">
            {(brandAffinities.length
              ? brandAffinities.map((item) => (
                  <Badge key={item.name}>
                    {item.name} · {item.score}%
                  </Badge>
                ))
              : (preferences?.favorite_brands || []).map((brand) => (
                  <Badge key={brand} variant="secondary">
                    {brand}
                  </Badge>
                ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
