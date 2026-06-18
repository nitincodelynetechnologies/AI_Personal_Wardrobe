'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const OVERLAY_GUIDES = {
  front: 'Center your face in the oval',
  left: 'Turn head left — show your profile',
  right: 'Turn head right — show your profile',
  smile: 'Face forward and smile naturally',
};

export const CameraViewfinder = forwardRef(function CameraViewfinder(
  { currentStep, isReady, className },
  ref,
) {
  const guideText = currentStep ? OVERLAY_GUIDES[currentStep.id] : 'Align your face';

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl',
        'border border-white/10 bg-noir shadow-2xl shadow-black/40',
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            'scale-x-[-1]',
            !isReady && 'opacity-0',
          )}
          aria-label="Camera preview for face registration"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-noir-elevated">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
          </div>
        )}

        {/* Gradient vignette */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"
          aria-hidden
        />

        {/* Face alignment overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[58%] w-[52%] max-h-80 max-w-64">
            <div
              className={cn(
                'absolute inset-0 rounded-[50%] border-2 border-dashed',
                'border-champagne/60 animate-pulse-ring',
              )}
              aria-hidden
            />
            <div
              className="absolute inset-2 rounded-[50%] border border-white/10"
              aria-hidden
            />
            {/* Corner brackets */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
              (pos) => (
                <div
                  key={pos}
                  className={cn(
                    'absolute h-6 w-6 border-champagne sm:h-8 sm:w-8',
                    pos.includes('top') ? 'border-t-2' : 'border-b-2',
                    pos.includes('left') ? 'border-l-2 rounded-tl-lg' : 'border-r-2 rounded-tr-lg',
                    pos.includes('bottom') && pos.includes('left') && 'rounded-bl-lg rounded-tl-none',
                    pos.includes('bottom') && pos.includes('right') && 'rounded-br-lg rounded-tr-none',
                  )}
                  aria-hidden
                />
              ),
            )}
          </div>
        </div>

        {/* Guide text */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="glass-panel rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-champagne/80">
              {currentStep?.label || 'Face Capture'}
            </p>
            <p className="mt-1 text-sm text-foreground sm:text-base">{guideText}</p>
          </div>
        </div>

        {/* Scan line effect */}
        {isReady && (
          <div
            className="pointer-events-none absolute left-4 right-4 top-[30%] h-px animate-scan bg-gradient-to-r from-transparent via-champagne/50 to-transparent"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
});
