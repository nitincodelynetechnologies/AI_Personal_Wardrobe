'use client';

import dynamic from 'next/dynamic';
import { Component } from 'react';
import { Loader2 } from 'lucide-react';
import { loadVirtualTryOnModalComponent } from '@/features/try-on/loadVirtualTryOnModal';

const VirtualTryOnModal = dynamic(() => loadVirtualTryOnModalComponent(), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-obsidian/85 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-full border border-magenta/30 bg-obsidian px-4 py-2 text-xs font-mono uppercase tracking-widest text-magenta">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading try-on studio…
      </div>
    </div>
  ),
});

class TryOnChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(error) {
    const message = error?.message ?? '';
    if (
      error?.name === 'ChunkLoadError' ||
      message.includes('ChunkLoadError') ||
      message.includes('Loading chunk')
    ) {
      return { failed: true };
    }
    return null;
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-obsidian/90 p-6">
          <div className="max-w-sm rounded-xl border border-magenta/30 bg-[#1a1025] p-6 text-center">
            <p className="text-sm font-medium text-white">Try-on module failed to load</p>
            <p className="mt-2 text-xs text-slate-400">
              The 3D try-on bundle timed out. Refresh the page and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-magenta px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function TryOnModalDynamic({ open, onOpenChange, product }) {
  if (!open || !product) return null;

  return (
    <TryOnChunkErrorBoundary>
      <VirtualTryOnModal open={open} onOpenChange={onOpenChange} product={product} />
    </TryOnChunkErrorBoundary>
  );
}
