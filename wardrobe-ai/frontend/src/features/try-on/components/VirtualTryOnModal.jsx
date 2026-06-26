'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Sparkles, ShoppingBag, Heart, Share2, Loader2 } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { formatCatalogPrice, resolveProductImageUrl } from '@/features/catalog/constants/catalogOptions';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { requestVirtualTryOn } from '@/features/try-on/services/tryOnService';
import { ShareMenu } from '@/features/try-on/components/ShareMenu';
import { triggerNativeShare } from '@/features/try-on/utils/shareUtils';
import { getProductTorsoColor } from '@/features/try-on/utils/productTorsoColor';
import { getTryOnGarmentGlbUrl } from '@/features/catalog/constants/garmentModels';
import { AvatarTypeSelector } from '@/features/try-on/components/AvatarTypeSelector';
import { Smart2DMannequin } from '@/features/try-on/components/Smart2DMannequin';
import { AVATAR_TYPES, DEFAULT_AVATAR_TYPE } from '@/features/try-on/constants/avatarOptions';
import {
  getTryOnGender,
  TRY_ON_IMAGE_SIZES,
  TRY_ON_STATUS_INTERVAL_MS,
  TRY_ON_STATUS_MESSAGES,
} from '@/features/try-on/constants/tryOnOptions';

const ThreeDViewer = dynamic(() => import('@/components/ThreeDViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-obsidian">
      <p className="text-xs font-mono uppercase tracking-widest text-magenta">Loading 3D viewer…</p>
    </div>
  ),
});

const Mini3DViewer = dynamic(() => import('@/components/Mini3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 animate-pulse bg-[#150d22]" aria-hidden />
  ),
});

const CANVAS_PANEL =
  'relative h-[450px] w-full overflow-hidden rounded-xl border border-borderColor bg-[#0a0612]';

const COLUMN_LABEL =
  'mb-2 shrink-0 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400';

export function VirtualTryOnModal({ open, onOpenChange, product }) {
  const showToast = useToastStore((state) => state.showToast);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const { avatarUrl: userFace } = useAuthUser();
  const addToCart = useCartStore((state) => state.addToCart);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    product?.id ? state.items.some((item) => item.id === String(product.id)) : false,
  );

  const [avatarType, setAvatarType] = useState(DEFAULT_AVATAR_TYPE);
  const [phase, setPhase] = useState('preview');
  const [statusIndex, setStatusIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const isPremiumAvatar = avatarType === AVATAR_TYPES.PREMIUM;

  const genderLabel = useMemo(
    () => (product && getTryOnGender(product.category) === 'female' ? 'Female' : 'Male'),
    [product],
  );

  const explicitGlbUrl = useMemo(() => getTryOnGarmentGlbUrl(product), [product]);
  const torsoColor = useMemo(() => getProductTorsoColor(product), [product]);
  const selectedImageUrl = useMemo(() => resolveProductImageUrl(product), [product]);
  const is3dGarment = Boolean(explicitGlbUrl);

  const resetState = useCallback(() => {
    setAvatarType(DEFAULT_AVATAR_TYPE);
    setPhase('preview');
    setStatusIndex(0);
    setIsSubmitting(false);
    setShareMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, resetState]);

  useEffect(() => {
    if (!open || !product?.id) return;
    setPhase('preview');
    setStatusIndex(0);
    setIsSubmitting(false);
    setShareMenuOpen(false);
  }, [open, product?.id]);

  useEffect(() => {
    if (phase !== 'processing') return undefined;

    const interval = setInterval(() => {
      setStatusIndex((current) => (current + 1) % TRY_ON_STATUS_MESSAGES.length);
    }, TRY_ON_STATUS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [phase]);

  const handleInitialize = async () => {
    if (!product || !accessToken) {
      showToast({ message: 'Sign in to use Virtual Try-On.', variant: 'destructive' });
      return;
    }

    const userId = user?.id;
    if (!userId) {
      showToast({ message: 'User profile unavailable. Please sign in again.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    setPhase('processing');
    setStatusIndex(0);

    try {
      await requestVirtualTryOn(accessToken, {
        productId: product.id,
        userId,
      });
      setPhase('result');
    } catch (error) {
      showToast({ message: getNetworkErrorMessage(error), variant: 'destructive' });
      setPhase('preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    await triggerNativeShare(product, {
      onFallback: () => setShareMenuOpen(true),
    });
  };

  const handleShareLinkCopied = () => {
    showToast({
      message: 'Link copied! Ready to paste on Instagram.',
      variant: 'success',
    });
  };

  const handleAddToCart = () => {
    closeWishlist();
    addToCart(product);
    onOpenChange(false);
    showToast({ message: `${product.name} added to your bag.`, variant: 'success' });
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    showToast({
      message: added
        ? `${product.name} saved to wishlist.`
        : `${product.name} removed from wishlist.`,
      variant: 'success',
    });
  };

  if (!product) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/90 p-4 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex w-full max-w-6xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-borderColor bg-white dark:bg-[#150d22] shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-borderColor px-6 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-700 dark:text-gray-400">
                Virtual Try-On
              </p>
              <DialogPrimitive.Title className="font-playfair text-xl font-semibold text-slate-900 dark:text-white">
                {product.name}
              </DialogPrimitive.Title>
              <p className="text-sm text-slate-700 dark:text-gray-400">
                {product.brand} · {formatCatalogPrice(product.price)} · {genderLabel} Avatar
              </p>
            </div>
            <DialogPrimitive.Close className="rounded-full border border-borderColor p-2 text-slate-700 dark:text-gray-400 transition-colors hover:bg-background/50 hover:text-slate-900 dark:text-white">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="custom-scrollbar max-h-[70vh] min-h-0 overflow-y-auto pr-2 lg:max-h-[75vh]">
            <div className="grid w-full grid-cols-1 items-stretch gap-6 p-4 lg:grid-cols-2 lg:p-6">
            <div className="flex w-full flex-col">
              <p className={COLUMN_LABEL}>Selected Piece</p>
              <div className={CANVAS_PANEL}>
                {explicitGlbUrl ? (
                  <Mini3DViewer
                    key={`piece-${product.id}-${explicitGlbUrl}`}
                    glbUrl={explicitGlbUrl}
                    className="absolute inset-0 rounded-xl"
                  />
                ) : (
                  <Image
                    key={`piece-${product.id}-2d`}
                    src={selectedImageUrl}
                    alt={product.name}
                    fill
                    sizes={TRY_ON_IMAGE_SIZES}
                    className="absolute inset-0 h-full w-full object-cover"
                    priority
                  />
                )}
              </div>
            </div>

            <div className="flex w-full flex-col">
              <p className={COLUMN_LABEL}>
                {isPremiumAvatar ? 'Premium 3D Avatar' : 'Basic 2D Avatar'}
              </p>

              <div className={CANVAS_PANEL}>
                {isPremiumAvatar ? (
                  open &&
                  product && (
                    <ThreeDViewer
                      key={`try-on-premium-${product.id}-${explicitGlbUrl ?? 'base-only'}`}
                      userFaceUrl={userFace}
                      productImageUrl={is3dGarment ? selectedImageUrl : null}
                      torsoColor={torsoColor}
                      selectedGlbUrl={explicitGlbUrl}
                      className="absolute inset-0 h-full w-full"
                    />
                  )
                ) : (
                  <Smart2DMannequin
                    key={`try-on-basic-${product.id}`}
                    product={product}
                    garmentImageUrl={selectedImageUrl}
                    userFaceUrl={userFace}
                    className="absolute inset-0 h-full w-full"
                  />
                )}

                {phase === 'processing' && (
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-violet/10 via-transparent to-magenta/10">
                    <div
                      className="absolute inset-x-0 top-0 h-1 animate-try-on-scan bg-gradient-to-r from-transparent via-magenta to-violet"
                      aria-hidden
                    />
                  </div>
                )}

                {isPremiumAvatar && !userFace && (
                  <div className="pointer-events-auto absolute inset-x-3 top-3 z-20 rounded-lg border border-amber-400/30 bg-background/90 px-3 py-2 text-center backdrop-blur-sm">
                    <p className="text-[11px] leading-relaxed text-amber-200/90">
                      Set up Face Studio for your face on the avatar.
                    </p>
                    <Link
                      href="/face-studio"
                      className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-widest text-amber-400 hover:text-amber-300"
                    >
                      Open Face Studio
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className="mt-6 border-t border-borderColor px-6 pb-4 pt-4">
            <div className="mb-4 flex justify-center">
              <AvatarTypeSelector
                value={avatarType}
                onChange={setAvatarType}
                className="w-full max-w-xl"
              />
            </div>

            <div className="mb-4 rounded-xl border border-magenta/20 bg-magenta/5 p-4">
              {phase === 'preview' && (
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {isPremiumAvatar
                      ? 'WebGL Avatar · Drag to spin 360°'
                      : 'Basic 2D Avatar · Instant static preview'}
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-gray-400">
                    {isPremiumAvatar
                      ? is3dGarment
                        ? 'The selected 3D garment is fitted on your photorealistic digital avatar.'
                        : 'Preview how this piece pairs with your avatar — base model only, no garment overlay.'
                      : 'Fast 2D mannequin preview with your selected piece. Switch to Premium for interactive 3D fitting.'}
                  </p>
                </div>
              )}

              {phase === 'processing' && (
                <p className="flex items-center justify-center gap-2 text-center text-sm font-medium text-slate-900 dark:text-white">
                  <Loader2 className="h-4 w-4 animate-spin text-magenta" />
                  {TRY_ON_STATUS_MESSAGES[statusIndex]}
                </p>
              )}

              {phase === 'result' && (
                <p className="text-center font-mono text-sm uppercase tracking-widest text-magenta">
                  ✨ AI GENERATION COMPLETE
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              {phase === 'preview' && (
                <button
                  type="button"
                  onClick={handleInitialize}
                  disabled={isSubmitting}
                  className="inline-flex min-w-[280px] items-center justify-center gap-2 rounded-full bg-magenta px-8 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white transition-all duration-300 hover:bg-magenta/80 hover:shadow-[0_0_20px_rgba(233,30,140,0.5)] disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Initialize AI Try-On
                </button>
              )}

              {phase === 'processing' && (
                <p className="text-xs uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400">
                  Neural fitting engine in progress
                </p>
              )}

              {phase === 'result' && (
                <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-magenta px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-magenta/80"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-borderColor px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-white transition-colors hover:border-violet/40 hover:bg-violet/10"
                  >
                    <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current text-magenta')} />
                    {isInWishlist ? 'Saved' : 'Save to Wishlist'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-borderColor px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-white transition-colors hover:border-violet/40 hover:bg-violet/10"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <ShareMenu
        open={shareMenuOpen}
        onOpenChange={setShareMenuOpen}
        product={product}
        onLinkCopied={handleShareLinkCopied}
      />
    </DialogPrimitive.Root>
  );
}
