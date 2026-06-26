'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Heart, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
import { getExplicitProductGlbUrl } from '@/features/catalog/constants/garmentModels';
import { useDeleteWardrobeItem } from '@/features/wardrobe/hooks/useDeleteWardrobeItem';
import { WARDROBE_GRID_IMAGE_SIZES } from '@/features/wardrobe/constants/wardrobeOptions';

const Mini3DViewer = dynamic(() => import('@/components/Mini3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 animate-pulse bg-[#150d22]" aria-hidden />
  ),
});

const STUDIO_CARD =
  'bg-white dark:bg-[#150d22] backdrop-blur-lg border border-borderColor rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(233,30,140,0.25)] hover:border-violet/30 cursor-pointer group';

export function WardrobeItemCard({ item }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteItem, isPending } = useDeleteWardrobeItem();
  const glbUrl = useMemo(() => getExplicitProductGlbUrl(item), [item]);

  const handleConfirmDelete = () => {
    deleteItem(item.id, {
      onSettled: () => setOpen(false),
    });
  };

  return (
    <>
      <div className={STUDIO_CARD}>
        <div className="relative aspect-[3/4] overflow-hidden bg-white dark:bg-[#150d22]">
          {glbUrl ? (
            <Mini3DViewer glbUrl={glbUrl} className="absolute inset-0 rounded-none" />
          ) : (
            <Image
              src={item.image_url}
              alt={item.sub_category || item.category}
              fill
              sizes={WARDROBE_GRID_IMAGE_SIZES}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute left-2 top-2 h-8 w-8 rounded-full bg-black/70 text-slate-600 dark:text-gray-400 opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
            onClick={() => setOpen(true)}
            aria-label="Delete clothing item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {item.is_favorite && (
            <span className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5">
              <Heart className="h-3.5 w-3.5 fill-[#e91e8c] text-magenta" />
            </span>
          )}
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-playfair font-medium text-slate-900 dark:text-white">
                {item.sub_category || item.category}
              </p>
              <p className="text-xs text-magenta/80">{item.category}</p>
            </div>
            {item.color_hex && (
              <span
                className="mt-1 h-4 w-4 shrink-0 rounded-full border border-borderColor"
                style={{ backgroundColor: item.color_hex }}
                title={item.color_hex}
              />
            )}
          </div>
          <Badge
            variant="outline"
            className={cn('text-[10px] uppercase tracking-wide', 'border-borderColor text-slate-600 dark:text-gray-400')}
          >
            {item.season}
          </Badge>
        </div>
      </div>

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
