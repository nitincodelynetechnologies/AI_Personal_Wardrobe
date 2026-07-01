'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Heart, Shirt, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { WARDROBE_IMAGE_FALLBACK } from '@/features/face-studio/constants/bodyVtonMockData';
import { DEFAULT_BODY_PREVIEW_IMAGE } from '@/features/face-studio/constants/bodyAnalysisMockData';
import { readSavedLooks, writeSavedLooks } from '@/features/face-studio/utils/bodyScanStorage';
import { mapWardrobeItemsToVtonGarments } from '@/features/face-studio/utils/vtonWardrobeUtils';
import { requestIdmVton, fetchVtonHealth } from '@/features/face-studio/services/vtonService';
import { VtonMockPairingView } from '@/features/face-studio/components/VtonMockPairingView';
import { useWardrobe } from '@/features/wardrobe/hooks/useWardrobe';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { usePremiumGate } from '@/features/auth/hooks/usePremiumGate';

const TYPE_LABELS = {
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Shoes',
};

function handleWardrobeImageError(event) {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = WARDROBE_IMAGE_FALLBACK;
}

export function VirtualAIFittingRoom({ userBodyImage, className }) {
  const { userId } = useAuthUser();
  const showToast = useToastStore((state) => state.showToast);
  const { gatePremium, PremiumGateModal } = usePremiumGate();
  const wardrobeItems = useWardrobeStore((state) => state.items);

  const { isLoading: isWardrobeLoading } = useWardrobe();

  const [selectedGarment, setSelectedGarment] = useState(null);
  const [isGeneratingVTON, setIsGeneratingVTON] = useState(false);
  const [isVtonSuccess, setIsVtonSuccess] = useState(false);
  const [vtonResultImage, setVtonResultImage] = useState(null);
  const [vtonPreviewMode, setVtonPreviewMode] = useState(null);
  const [vtonAiReady, setVtonAiReady] = useState(false);

  const canvasImage = userBodyImage || DEFAULT_BODY_PREVIEW_IMAGE;

  const realWardrobe = useMemo(
    () => mapWardrobeItemsToVtonGarments(wardrobeItems),
    [wardrobeItems],
  );

  const resetVtonState = useCallback(() => {
    setSelectedGarment(null);
    setIsGeneratingVTON(false);
    setIsVtonSuccess(false);
    setVtonResultImage(null);
    setVtonPreviewMode(null);
  }, []);

  useEffect(() => {
    resetVtonState();
  }, [canvasImage, resetVtonState]);

  useEffect(() => {
    let cancelled = false;

    const refreshHealth = async () => {
      const health = await fetchVtonHealth();
      if (!cancelled) setVtonAiReady(health?.mock === false);
    };

    refreshHealth();
    const intervalId = setInterval(refreshHealth, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const handleVirtualTryOn = useCallback(
    async (garment, { forceAi = false } = {}) => {
      if (isGeneratingVTON) return;
      if (!forceAi && selectedGarment?.id === garment.id && isVtonSuccess) return;

      setSelectedGarment(garment);
      setIsGeneratingVTON(true);
      setIsVtonSuccess(false);
      setVtonResultImage(null);
      setVtonPreviewMode(null);

      try {
        const data = await requestIdmVton({
          userImageSource: canvasImage,
          garmentImageSource: garment.img,
          garmentDescription: garment.name,
        });

        if (data.success && data.result_image_url) {
          if (data.mock) {
            setVtonPreviewMode('mock');
            setVtonResultImage(null);
          } else {
            setVtonPreviewMode('ai');
            setVtonResultImage(data.result_image_url);
          }
          setIsVtonSuccess(true);
          showToast({
            message: data.backend_offline
              ? data.fallback_reason
              : data.gpu_fallback
                ? data.fallback_reason ||
                  `Hugging Face GPU busy — dev pairing for ${garment.name}. Retry later for real AI.`
                : data.mock
                  ? `Selected ${garment.name} — dev pairing (set VTON_MOCK=false for real AI fit)`
                  : `IDM-VTON fit applied: ${garment.name}`,
            variant: data.backend_offline ? 'default' : 'success',
          });
        } else {
          throw new Error(data.error || 'AI processing failed');
        }
      } catch (error) {
        console.error('AI Error:', error);

        if (error instanceof Error && /gpu|retry later|hugging face/i.test(error.message)) {
          setVtonPreviewMode('mock');
          setVtonResultImage(null);
          setIsVtonSuccess(true);
          showToast({
            message:
              'Hugging Face has no free GPU — showing dev pairing. Retry later for real IDM-VTON, or use mock mode (start.ps1).',
            variant: 'success',
          });
          return;
        }

        showToast({
          message: error instanceof Error ? error.message : 'AI processing failed. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsGeneratingVTON(false);
      }
    },
    [canvasImage, isGeneratingVTON, isVtonSuccess, selectedGarment?.id, showToast],
  );

  const handleSaveLook = useCallback(() => {
    gatePremium(() => {
      const imageToSave =
        vtonResultImage ||
        (vtonPreviewMode === 'mock' && selectedGarment ? canvasImage : null);

      if (!imageToSave) {
        showToast({
          message: 'No AI generated fit found to save. Run a virtual try-on first.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const existingLooks = readSavedLooks(userId);

        const newLook = {
          id: Date.now(),
          image: imageToSave,
          garmentName: selectedGarment?.name || 'Custom Fit',
          category: selectedGarment?.type || 'Outfit',
          garmentId: selectedGarment?.id ?? null,
          garmentImage: selectedGarment?.img ?? null,
          date: new Date().toISOString(),
        };

        const isDuplicate = existingLooks.some(
          (look) =>
            (look.image ?? look.finalImage) === imageToSave &&
            (look.garmentName ?? look.garment?.name) === newLook.garmentName,
        );
        if (isDuplicate) {
          showToast({
            message: 'This look is already saved in your Personal Closet.',
            variant: 'default',
          });
          return;
        }

        const saved = writeSavedLooks([...existingLooks, newLook], userId);
        if (!saved) {
          showToast({
            message: 'Could not save the look. Storage may be full — try again.',
            variant: 'destructive',
          });
          return;
        }

        showToast({
          message: '✨ Look saved to Personal Closet!',
          variant: 'success',
        });
      } catch (error) {
        console.error('Storage Error:', error);
        const isQuotaError =
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' || error.code === 22);
        showToast({
          message: isQuotaError
            ? 'Storage full! Clear some older saved looks and try again.'
            : 'Could not save the look. Please try again.',
          variant: 'destructive',
        });
      }
    });
  }, [
    canvasImage,
    gatePremium,
    selectedGarment,
    showToast,
    userId,
    vtonPreviewMode,
    vtonResultImage,
  ]);

  const handleClearLook = useCallback(() => {
    setIsVtonSuccess(false);
    setVtonResultImage(null);
    setVtonPreviewMode(null);
    setSelectedGarment(null);
  }, []);

  const showAiResult = isVtonSuccess && vtonPreviewMode === 'ai' && vtonResultImage;
  const showMockPairing = isVtonSuccess && vtonPreviewMode === 'mock' && selectedGarment;
  const showPostGenerationActions =
    !isGeneratingVTON && selectedGarment && (showAiResult || showMockPairing);

  return (
    <section
      className={cn(
        'animate-fade-in-view mt-8 rounded-2xl border border-white/10 bg-[#150d22] p-6 shadow-xl',
        className,
      )}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-pink-500" aria-hidden />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-pink-400">
              Module · IDM-VTON
            </p>
            <h3 className="font-playfair text-xl font-bold text-white">Virtual AI Fitting Room</h3>
          </div>
        </div>
        {selectedGarment && isVtonSuccess && (
          <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-pink-300">
            {TYPE_LABELS[selectedGarment.type] ?? selectedGarment.type} · {selectedGarment.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex w-full flex-col gap-4">
          <div className="relative flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#0a0612] sm:h-[560px]">
            {isGeneratingVTON ? (
              <div className="flex flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-pink-500 border-t-transparent shadow-[0_0_15px_#ec4899]" />
                <p className="animate-pulse rounded-lg bg-black/50 px-4 py-2 text-sm font-bold text-pink-400 backdrop-blur-md">
                  {vtonAiReady
                    ? 'AI is fitting the garment to your body… (2–5 minutes, please wait)'
                    : 'AI is fitting the garment perfectly to your body… (~15–30 secs)'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Running IDM-VTON on {selectedGarment?.name ?? 'garment'}
                </p>
              </div>
            ) : showAiResult ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vtonResultImage}
                alt="AI virtual try-on result"
                className="h-full w-full object-contain"
              />
            ) : showMockPairing ? (
              <VtonMockPairingView
                bodyImage={canvasImage}
                garment={selectedGarment}
                aiReady={vtonAiReady}
                isGenerating={isGeneratingVTON}
                onRunAiFit={() => handleVirtualTryOn(selectedGarment, { forceAi: true })}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={canvasImage}
                alt="User body scan"
                className="h-full w-full object-contain"
              />
            )}

            {!isGeneratingVTON && showPostGenerationActions && (
              <div className="absolute left-4 top-4 rounded-full border border-emerald-500 bg-emerald-500/20 px-3 py-1 text-[10px] uppercase tracking-widest text-emerald-400 backdrop-blur-md">
                {vtonPreviewMode === 'mock' ? 'Dev pairing' : 'IDM-VTON'}: {selectedGarment.name}
              </div>
            )}
          </div>

          {showPostGenerationActions && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a0612]/80 p-3 backdrop-blur-sm">
              <button
                type="button"
                onClick={handleSaveLook}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Heart className="h-4 w-4 fill-current" aria-hidden />
                Save to Closet
              </button>
              <button
                type="button"
                onClick={handleClearLook}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Discard
              </button>
            </div>
          )}
        </div>

        <div className="flex h-[600px] w-full flex-col gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <Shirt className="h-4 w-4 text-slate-400" aria-hidden />
            <h4 className="text-sm font-semibold text-slate-300">
              Select from Wardrobe ({realWardrobe.length} Items)
            </h4>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-2 pb-4">
            {isWardrobeLoading && realWardrobe.length === 0 ? (
              <p className="text-xs text-slate-400">Loading your wardrobe…</p>
            ) : realWardrobe.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {realWardrobe.map((item) => {
                  const isSelected = selectedGarment?.id === item.id && isVtonSuccess;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleVirtualTryOn(item)}
                      disabled={isGeneratingVTON}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-2 transition-all disabled:cursor-not-allowed disabled:opacity-50',
                        isSelected
                          ? 'scale-95 border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10',
                      )}
                    >
                      <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={handleWardrobeImageError}
                        />
                      </div>
                      <span className="line-clamp-2 text-center text-[10px] leading-tight text-slate-300">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="col-span-full text-xs text-slate-400">
                Your wardrobe is empty. Add items from the Wardrobe page or Catalog first!
              </p>
            )}
          </div>

        </div>
      </div>
      <PremiumGateModal />
    </section>
  );
}
