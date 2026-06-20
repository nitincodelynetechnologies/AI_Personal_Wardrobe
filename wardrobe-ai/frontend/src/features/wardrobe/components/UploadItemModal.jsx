'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { uploadWardrobeItem } from '@/features/wardrobe/services/wardrobeService';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { compressClothingImage } from '@/lib/compressImage';
import {
  ACCEPTED_IMAGE_TYPES,
  CLOTHING_CATEGORIES,
  CLOTHING_COLOR_SWATCHES,
  CLOTHING_SEASONS,
  MAX_UPLOAD_SIZE_MB,
} from '@/features/wardrobe/constants/wardrobeOptions';

const INITIAL_FORM = {
  category: 'Top',
  sub_category: '',
  color_hex: '',
  season: 'All',
};

export function UploadItemModal({ open, onOpenChange }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addItem = useWardrobeStore((state) => state.addItem);
  const addDashboardItem = useDashboardStore((state) => state.addWardrobeItem);
  const showToast = useToastStore((state) => state.showToast);
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setFile(null);
    setPreviewUrl('');
    setForm(INITIAL_FORM);
    setError('');
    setDragActive(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (selectedFile) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed.';
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      return `Image must be under ${MAX_UPLOAD_SIZE_MB}MB.`;
    }

    return '';
  };

  const handleFileSelect = (selectedFile) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }

    setIsSubmitting(true);
    setSubmitPhase('compressing');
    setError('');

    try {
      let uploadFile = file;

      try {
        uploadFile = await compressClothingImage(file);
      } catch (compressError) {
        const message =
          compressError instanceof Error
            ? compressError.message
            : 'Unable to compress image. Please try another photo.';
        setError(message);
        showToast({ message, variant: 'destructive' });
        return;
      }

      setSubmitPhase('uploading');

      const item = await uploadWardrobeItem({
        token: accessToken,
        file: uploadFile,
        metadata: form,
      });

      addItem(item);
      addDashboardItem(item);
      showToast({ message: 'Item saved to your wardrobe!', variant: 'success' });
      onOpenChange(false);
    } catch (submitError) {
      const message = getNetworkErrorMessage(submitError);
      setError(message);
      showToast({ message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setSubmitPhase(null);
    }
  };

  const submitLabel = (() => {
    if (!isSubmitting) return 'Save to Wardrobe';
    if (submitPhase === 'compressing') return 'Compressing photo…';
    return 'AI is magically removing the background…';
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="mb-0 shrink-0 border-b border-white/10 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle>Add to Wardrobe</DialogTitle>
          <DialogDescription>
            Upload a clothing photo and tag it so AI can match outfits to your style.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:space-y-5 sm:px-6 sm:py-5">
            <div
              role="button"
              tabIndex={0}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => event.key === 'Enter' && fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors sm:gap-3 sm:p-6',
                dragActive
                  ? 'border-champagne bg-champagne/10'
                  : 'border-white/15 bg-noir/50 hover:border-champagne/40',
              )}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-32 w-full rounded-lg object-contain sm:max-h-40"
                />
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne/10 sm:h-14 sm:w-14">
                    <ImagePlus className="h-6 w-6 text-champagne sm:h-7 sm:w-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium sm:text-base">Drag & drop your clothing image</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      or click to browse (max {MAX_UPLOAD_SIZE_MB}MB)
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) handleFileSelect(selected);
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOTHING_CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Season</Label>
                <Select
                  value={form.season}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, season: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOTHING_SEASONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sub-category (optional)</Label>
              <Input
                placeholder="e.g. T-Shirt, Jeans, Sneakers"
                value={form.sub_category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sub_category: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_COLOR_SWATCHES.map((color) => {
                  const selected = form.color_hex === color.hex;
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      title={color.label}
                      onClick={() => setForm((prev) => ({ ...prev, color_hex: color.hex }))}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        selected ? 'border-champagne ring-2 ring-champagne/40' : 'border-white/20',
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-3 border-t border-white/10 bg-noir-elevated px-5 py-4 sm:px-6">
            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
