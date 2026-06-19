'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

function SkeletonBlock({ className }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
      </div>

      <Card className="border-white/10 bg-noir-elevated/30">
        <CardHeader className="space-y-2">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonBlock className="h-20 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-36" />
            <SkeletonBlock className="h-36" />
          </div>
          <SkeletonBlock className="h-24 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
    </div>
  );
}
