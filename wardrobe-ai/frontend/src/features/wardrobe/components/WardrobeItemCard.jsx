'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function WardrobeItemCard({ item }) {
  return (
    <Card className="group overflow-hidden border-white/10 bg-noir-elevated/40 transition-colors hover:border-champagne/30">
      <div className="relative aspect-[3/4] overflow-hidden bg-noir">
        <Image
          src={item.image_url}
          alt={item.sub_category || item.category}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        {item.is_favorite && (
          <span className="absolute right-2 top-2 rounded-full bg-noir/80 p-1.5">
            <Heart className="h-3.5 w-3.5 fill-champagne text-champagne" />
          </span>
        )}
      </div>
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {item.sub_category || item.category}
            </p>
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </div>
          {item.color_hex && (
            <span
              className="mt-1 h-4 w-4 shrink-0 rounded-full border border-white/20"
              style={{ backgroundColor: item.color_hex }}
              title={item.color_hex}
            />
          )}
        </div>
        <Badge
          variant="outline"
          className={cn('text-[10px] uppercase tracking-wide', 'border-white/10 text-muted-foreground')}
        >
          {item.season}
        </Badge>
      </CardContent>
    </Card>
  );
}
