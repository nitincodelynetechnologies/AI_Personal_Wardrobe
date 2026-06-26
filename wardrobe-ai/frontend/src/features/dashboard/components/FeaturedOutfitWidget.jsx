'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyRecommendationsState } from '@/features/dashboard/components/EmptyRecommendationsState';
import { OUTFIT_IMAGE_SIZES } from '@/features/wardrobe/constants/wardrobeOptions';

function FeaturedPiece({ item, label, className }) {
  if (!item?.image_url) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed border-borderColor bg-background/60 text-xs text-muted-foreground',
          className,
        )}
      >
        No {label}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-background', className)}>
      <Image
        src={item.image_url}
        alt={item.sub_category || item.category || label}
        fill
        sizes={OUTFIT_IMAGE_SIZES}
        className="object-cover"
      />
      <span className="absolute bottom-1 left-1 rounded bg-background/75 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-violet">
        {label}
      </span>
    </div>
  );
}

function FeaturedOutfitSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] animate-pulse rounded-lg bg-white/5 dark:bg-[#150d22]/5" />
      <div className="grid grid-cols-2 gap-2">
        <div className="aspect-square animate-pulse rounded-lg bg-white/5 dark:bg-[#150d22]/5" />
        <div className="aspect-square animate-pulse rounded-lg bg-white/5 dark:bg-[#150d22]/5" />
      </div>
    </div>
  );
}

export function FeaturedOutfitWidget({ outfit, isLoading = false }) {
  if (!isLoading && !outfit) {
    return <EmptyRecommendationsState />;
  }

  const scoreTone =
    outfit?.style_score >= 90
      ? 'border-magenta/30 bg-magenta/10 text-magenta'
      : outfit?.style_score >= 80
        ? 'border-violet/30 bg-violet/10 text-violet'
        : 'border-borderColor bg-white/5 dark:bg-[#150d22]/5 text-foreground';

  return (
    <Card className="animate-fade-in-view stagger-3 border border-borderColor bg-white dark:bg-[#150d22] shadow-xl shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:border-violet/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 font-playfair text-lg">
            <Wand2 className="h-5 w-5 text-violet" />
            Today&apos;s Recommendation
          </CardTitle>
          <CardDescription>Your most recent AI-styled look.</CardDescription>
        </div>
        {outfit && (
          <Badge className={cn('shrink-0 tabular-nums', scoreTone)}>
            {outfit.style_score}% match
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <FeaturedOutfitSkeleton />
        ) : (
          <>
            <FeaturedPiece item={outfit.top} label="Top" className="aspect-[4/3] w-full" />
            <div className="grid grid-cols-2 gap-2">
              <FeaturedPiece item={outfit.bottom} label="Bottom" className="aspect-square" />
              <FeaturedPiece item={outfit.footwear} label="Shoes" className="aspect-square" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-sm text-muted-foreground">
                {outfit.name || 'AI Styled Look'} · {outfit.season_tag}
              </p>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/outfits">
                  <Sparkles className="h-4 w-4" />
                  Open Style Studio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
