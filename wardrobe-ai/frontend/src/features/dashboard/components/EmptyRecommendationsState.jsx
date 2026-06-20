'use client';

import Link from 'next/link';
import { Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmptyRecommendationsState() {
  return (
    <Card className="border-white/10 bg-noir-elevated/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Wand2 className="h-5 w-5 text-champagne" />
          Today&apos;s Recommendations
        </CardTitle>
        <CardDescription>Generate your first AI outfit from your wardrobe.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-champagne/40 bg-champagne/5">
          <Sparkles className="h-7 w-7 text-champagne/70" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">No outfits yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Head to Style Studio to let the AI stylist combine your tops, bottoms, and footwear.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/outfits">
            <Sparkles className="h-4 w-4" />
            Open Style Studio
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
