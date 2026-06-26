'use client';

import Link from 'next/link';
import { Shirt, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmptyWardrobeState() {
  return (
    <Card className="border-borderColor bg-white/30 dark:bg-[#150d22]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-playfair text-lg">
          <Shirt className="h-5 w-5 text-violet" />
          My Wardrobe
        </CardTitle>
        <CardDescription>Build your digital closet with AI-tagged clothing.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-violet/40 bg-violet/5">
          <Upload className="h-7 w-7 text-violet/70" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">No clothing items yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Upload your favorite pieces to unlock outfit planning and virtual try-on.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/closet">
            <Upload className="h-4 w-4" />
            Open Wardrobe
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
