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
  const showToast = useToastStore((state) => state.showToast);
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setError('');

    try {
      const item = await uploadWardrobeItem({
        token: accessToken,
        file,
        metadata: form,
      });

      addItem(item);
      showToast({ message: 'Item saved to your wardrobe!', variant: 'success' });
      onOpenChange(false);
    } catch (submitError) {
      const message = getNetworkErrorMessage(submitError);
      setError(message);
      showToast({ message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Wardrobe</DialogTitle>
          <DialogDescription>
            Upload a clothing photo and tag it so AI can match outfits to your style.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors',
              dragActive ? 'border-champagne bg-champagne/10' : 'border-white/15 bg-noir/50 hover:border-champagne/40',
            )}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-champagne/10">
                  <ImagePlus className="h-7 w-7 text-champagne" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Drag & drop your clothing image</p>
                  <p className="text-sm text-muted-foreground">or click to browse (max {MAX_UPLOAD_SIZE_MB}MB)</p>
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
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
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
              <Select value={form.season} onValueChange={(value) => setForm((prev) => ({ ...prev, season: value }))}>
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
              onChange={(event) => setForm((prev) => ({ ...prev, sub_category: event.target.value }))}
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Save to Wardrobe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
