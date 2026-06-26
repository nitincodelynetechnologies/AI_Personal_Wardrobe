'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Facebook, Link2, MessageCircle, Pin, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildSharePayload,
  copyShareLink,
  getFacebookShareUrl,
  getPinterestShareUrl,
  getWhatsAppShareUrl,
} from '@/features/try-on/utils/shareUtils';

const PLATFORM_LINKS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    accent: 'hover:border-[#25D366]/50 hover:bg-[#25D366]/10 hover:text-[#25D366]',
    getHref: (payload) => getWhatsAppShareUrl(payload.url, payload.text),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    accent: 'hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-[#1877F2]',
    getHref: (payload) => getFacebookShareUrl(payload.url),
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    icon: Pin,
    accent: 'hover:border-[#E60023]/50 hover:bg-[#E60023]/10 hover:text-[#E60023]',
    getHref: (payload) => getPinterestShareUrl(payload.url),
  },
];

export function ShareMenu({ open, onOpenChange, product, onLinkCopied }) {
  const payload = useMemo(() => buildSharePayload(product), [product]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  const handleCopyLink = async () => {
    try {
      await copyShareLink(payload.url);
      onLinkCopied?.();
      handleClose();
    } catch (error) {
      console.error('Copy link failed', error);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close share menu"
        className="absolute inset-0 bg-[#07030d]/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-menu-title"
        className={cn(
          'relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-magenta/25 bg-[#150d22] shadow-[0_0_40px_rgba(233,30,140,0.15)]',
          'animate-in fade-in-0 slide-in-from-bottom-4 zoom-in-95 duration-300 sm:slide-in-from-bottom-0',
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta to-transparent opacity-70" />

        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h2 id="share-menu-title" className="font-playfair text-xl font-semibold text-white">
              Share Your Look
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Spread your 3D AI wardrobe fit across social platforms.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-white/10 p-2 text-gray-400 transition-colors hover:border-magenta/40 hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          {PLATFORM_LINKS.map((platform) => {
            const Icon = platform.icon;
            return (
              <a
                key={platform.id}
                href={platform.getHref(payload)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className={cn(
                  'group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-200',
                  platform.accent,
                )}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#1a1028] transition-colors group-hover:border-current">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-300 group-hover:text-current">
                  {platform.label}
                </span>
              </a>
            );
          })}

          <button
            type="button"
            onClick={handleCopyLink}
            className="group col-span-2 flex items-center gap-3 rounded-xl border border-magenta/30 bg-magenta/10 px-4 py-3 text-left transition-all duration-200 hover:border-magenta/60 hover:bg-magenta/20"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-magenta/40 bg-[#1a1028] text-magenta">
              <Camera className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                Instagram
                <Link2 className="h-3.5 w-3.5 text-magenta" />
              </span>
              <span className="mt-0.5 block text-xs text-gray-400">
                Copy link — ready to paste in Stories or DMs
              </span>
            </span>
          </button>
        </div>

        <div className="border-t border-white/10 px-5 py-3">
          <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-500">
            <Share2 className="h-3 w-3 text-magenta" />
            Wardrobe AI · Virtual Try-On
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
