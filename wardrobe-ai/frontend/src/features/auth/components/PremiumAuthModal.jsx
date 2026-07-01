'use client';

import Link from 'next/link';
import { ScanFace, Sparkles, UserPlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export function PremiumAuthModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-borderColor p-0 dark:bg-slate-900">
        <div className="relative bg-gradient-to-br from-magenta/15 via-violet/10 to-transparent px-6 pb-2 pt-8 text-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-magenta/15 text-magenta ring-1 ring-magenta/30">
            <ScanFace className="h-7 w-7" aria-hidden />
          </div>
          <DialogTitle className="font-playfair text-xl font-semibold text-slate-900 dark:text-slate-100">
            Step into the Future of Fashion!
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            📸 Create your face profile or sign in to unlock the AI Fitting Room, custom Wishlist,
            and fast checkout.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-3 px-6 py-6">
          <Link
            href="/register/face"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-5 py-3 text-sm font-bold text-white transition-all hover:bg-magenta/90 hover:shadow-[0_0_24px_rgba(233,30,140,0.35)]"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Create Face Profile
          </Link>
          <Link
            href="/login/face"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-borderColor bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-magenta/40 dark:bg-slate-800 dark:text-slate-100"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Sign In
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
