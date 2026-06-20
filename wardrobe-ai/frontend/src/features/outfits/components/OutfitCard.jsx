'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
import { useOutfitFeedback } from '@/features/outfits/hooks/useOutfitFeedback';
import { useDeleteOutfit } from '@/features/outfits/hooks/useDeleteOutfit';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { OUTFIT_IMAGE_SIZES } from '@/features/wardrobe/constants/wardrobeOptions';

function OutfitPiece({ item, label, className, sizes = OUTFIT_IMAGE_SIZES }) {
  if (!item?.image_url) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-noir/60 text-xs text-muted-foreground',
          className,
        )}
      >
        No {label}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-noir', className)}>
      <Image
        src={item.image_url}
        alt={item.sub_category || item.category || label}
        fill
        sizes={sizes}
        className="object-cover"
      />
      <span className="absolute bottom-1 left-1 rounded bg-noir/75 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-champagne">
        {label}
      </span>
    </div>
  );
}

export function getFeedbackState(outfit) {
  if (outfit?.feedback === 'dislike') return 'dislike';
  if (outfit?.feedback === 'like' || outfit?.is_favorite) return 'like';
  return null;
}

export function OutfitCard({ outfit }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState(() => getFeedbackState(outfit));
  const liveOutfit =
    useOutfitStore((state) => state.outfits.find((item) => item.id === outfit.id)) ?? outfit;
  const { mutate: submitFeedback, isPending: isFeedbackPending, variables } = useOutfitFeedback();
  const { mutate: deleteOutfit, isPending: isDeleting } = useDeleteOutfit();

  useEffect(() => {
    setFeedbackState(getFeedbackState(liveOutfit));
  }, [liveOutfit]);

  const scoreTone =
    liveOutfit.style_score >= 90
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : liveOutfit.style_score >= 80
        ? 'border-champagne/30 bg-champagne/10 text-champagne'
        : 'border-white/10 bg-white/5 text-foreground';

  const pendingForCard = isFeedbackPending && variables?.outfitId === liveOutfit.id;

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!liveOutfit?.id) return;

    deleteOutfit(liveOutfit.id, {
      onSuccess: () => setDeleteOpen(false),
      onError: () => setDeleteOpen(false),
    });
  };

  const handleFeedbackClick = (event, isFavorite) => {
    event.stopPropagation();

    if (!liveOutfit?.id || pendingForCard) return;

    const nextState = isFavorite ? 'like' : 'dislike';
    setFeedbackState(nextState);

    submitFeedback(
      { outfitId: liveOutfit.id, isFavorite },
      {
        onError: () => setFeedbackState(getFeedbackState(liveOutfit)),
      },
    );
  };

  return (
    <>
      <Card className="group overflow-hidden border-white/10 bg-noir-elevated/40 transition-colors hover:border-champagne/30">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate font-display text-base font-semibold">
              {liveOutfit.name || 'AI Styled Look'}
            </p>
            <Badge variant="outline" className="border-white/10 text-[10px] uppercase tracking-wide">
              {liveOutfit.season_tag}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('shrink-0 tabular-nums', scoreTone)}>
              {liveOutfit.style_score}% match
            </Badge>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground opacity-100 hover:bg-destructive/20 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
              onClick={handleDeleteClick}
              aria-label="Delete outfit"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-0">
          <OutfitPiece item={liveOutfit.top} label="Top" className="aspect-[4/3] w-full" />

          <div className="grid grid-cols-2 gap-2">
            <OutfitPiece item={liveOutfit.bottom} label="Bottom" className="aspect-square" />
            <OutfitPiece item={liveOutfit.footwear} label="Shoes" className="aspect-square" />
          </div>

          {liveOutfit.accessory?.image_url && (
            <OutfitPiece
              item={liveOutfit.accessory}
              label="Accessory"
              className="aspect-[3/1] w-full"
            />
          )}

          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
            <p className="text-xs text-muted-foreground">How does this look?</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={feedbackState === 'like' ? 'default' : 'outline'}
                className={cn(
                  'gap-1.5',
                  feedbackState === 'like' && 'bg-champagne text-noir hover:bg-champagne/90',
                )}
                disabled={pendingForCard}
                onClick={(event) => handleFeedbackClick(event, true)}
                aria-pressed={feedbackState === 'like'}
              >
                <ThumbsUp className="h-4 w-4" />
                Like
              </Button>
              <Button
                type="button"
                size="sm"
                variant={feedbackState === 'dislike' ? 'destructive' : 'outline'}
                className="gap-1.5"
                disabled={pendingForCard}
                onClick={(event) => handleFeedbackClick(event, false)}
                aria-pressed={feedbackState === 'dislike'}
              >
                <ThumbsDown className="h-4 w-4" />
                Dislike
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete outfit?"
        description="Are you sure you want to delete this outfit? This action cannot be undone."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
