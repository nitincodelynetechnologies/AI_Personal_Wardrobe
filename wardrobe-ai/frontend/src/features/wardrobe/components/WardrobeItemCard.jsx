'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
import { useDeleteWardrobeItem } from '@/features/wardrobe/hooks/useDeleteWardrobeItem';
import { WARDROBE_GRID_IMAGE_SIZES } from '@/features/wardrobe/constants/wardrobeOptions';

export function WardrobeItemCard({ item }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteItem, isPending } = useDeleteWardrobeItem();

  const handleConfirmDelete = () => {
    deleteItem(item.id, {
      onSettled: () => setOpen(false),
    });
  };

  return (
    <>
      <Card className="group overflow-hidden border-white/10 bg-noir-elevated/40 transition-colors hover:border-champagne/30">
        <div className="relative aspect-[3/4] overflow-hidden bg-noir">
          <Image
            src={item.image_url}
            alt={item.sub_category || item.category}
            fill
            sizes={WARDROBE_GRID_IMAGE_SIZES}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute left-2 top-2 h-8 w-8 rounded-full bg-noir/80 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
            onClick={() => setOpen(true)}
            aria-label="Delete clothing item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete clothing item?"
        description="Are you sure you want to delete this item? This action cannot be undone."
        isDeleting={isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
