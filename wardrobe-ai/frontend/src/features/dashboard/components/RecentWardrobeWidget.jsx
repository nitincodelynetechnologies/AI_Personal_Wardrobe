'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shirt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyWardrobeState } from '@/features/dashboard/components/EmptyWardrobeState';
import { WARDROBE_GRID_IMAGE_SIZES } from '@/features/wardrobe/constants/wardrobeOptions';

function MiniItemSkeleton() {
  return <div className="aspect-[3/4] animate-pulse rounded-lg bg-white/5" />;
}

export function RecentWardrobeWidget({ items = [], isLoading = false }) {
  if (!isLoading && items.length === 0) {
    return <EmptyWardrobeState />;
  }

  return (
    <Card className="border-white/10 bg-noir-elevated/30">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Shirt className="h-5 w-5 text-champagne" />
            My Wardrobe
          </CardTitle>
          <CardDescription>Your latest AI-tagged additions.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-champagne">
          <Link href="/wardrobe">
            View Full Wardrobe
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <MiniItemSkeleton key={index} />)
            : items.map((item) => (
                <Link
                  key={item.id}
                  href="/wardrobe"
                  className="group overflow-hidden rounded-lg border border-white/10 bg-noir transition-colors hover:border-champagne/30"
                >
                  <div className="relative aspect-[3/4] bg-noir">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.sub_category || item.category}
                        fill
                        sizes={WARDROBE_GRID_IMAGE_SIZES}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 p-2">
                    <p className="truncate text-xs font-medium">
                      {item.sub_category || item.category}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {item.category}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
