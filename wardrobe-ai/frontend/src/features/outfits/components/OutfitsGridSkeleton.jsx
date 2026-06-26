'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function OutfitsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-borderColor bg-white/40 dark:bg-[#150d22]/40">
          <CardHeader className="space-y-3 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-white/5 dark:bg-[#150d22]/5" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/5 dark:bg-[#150d22]/5" />
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <div className="aspect-[4/3] animate-pulse rounded-lg bg-white/5 dark:bg-[#150d22]/5" />
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square animate-pulse rounded-lg bg-white/5 dark:bg-[#150d22]/5" />
              <div className="aspect-square animate-pulse rounded-lg bg-white/5 dark:bg-[#150d22]/5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
