'use client';

import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const PROMPT_COPY = {
  login: {
    title: 'Enable Your Camera',
    body: 'We need camera access to verify your face and sign you in. Your images are encrypted and processed on our secure AI service.',
  },
  register: {
    title: 'Enable Your Camera',
    body: 'We need camera access to create your secure face profile. Your images are encrypted and processed on our secure AI service.',
  },
};

export function PermissionDeniedFallback({ error, permission, onRetry }) {
  const isDenied = permission === 'denied';
  const isUnsupported = permission === 'unsupported' || permission === 'unavailable';

  return (
    <div className="flex w-full flex-col items-center gap-6 px-6 py-10 text-center animate-fade-up sm:py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
        <Camera className="h-9 w-9 text-destructive" aria-hidden />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {isDenied ? 'Camera Access Required' : 'Camera Unavailable'}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {error ||
            'Face registration requires camera access to capture your biometric profile securely.'}
        </p>
      </div>

      {isDenied && (
        <Alert variant="default" className="max-w-md text-left">
          <div className="space-y-2">
            <p className="font-medium text-foreground">How to enable camera access:</p>
            <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
              <li>Click the camera icon in your browser&apos;s address bar</li>
              <li>Select &quot;Allow&quot; for camera permissions</li>
              <li>Refresh the page or tap retry below</li>
            </ol>
          </div>
        </Alert>
      )}

      {!isUnsupported && (
        <Button onClick={onRetry} size="lg" className="min-w-[160px] gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Camera Access
        </Button>
      )}
    </div>
  );
}

export function CameraPermissionGate({
  permission,
  error,
  isReady,
  onRequest,
  purpose = 'register',
  children,
}) {
  const showPrompt = permission === 'prompt' && !isReady;
  const showError =
    permission === 'denied' ||
    permission === 'unsupported' ||
    permission === 'unavailable' ||
    permission === 'error';
  const showCamera = !showPrompt && !showError;
  const promptCopy = PROMPT_COPY[purpose] ?? PROMPT_COPY.register;

  return (
    <div className="relative w-full">
      {showCamera ? children : null}

      {showPrompt && (
        <div className="flex w-full flex-col items-center gap-5 px-6 py-10 text-center animate-fade-up sm:gap-6 sm:py-12">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24',
              'border border-primary/30 bg-primary/10 animate-pulse-ring',
            )}
          >
            <Camera className="h-9 w-9 text-primary sm:h-10 sm:w-10" aria-hidden />
          </div>
          <div className="max-w-sm space-y-2">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">{promptCopy.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{promptCopy.body}</p>
          </div>
          <Button onClick={onRequest} size="lg" className="min-w-[200px]">
            Allow Camera Access
          </Button>
        </div>
      )}

      {!showPrompt && showError && (
        <PermissionDeniedFallback error={error} permission={permission} onRetry={onRequest} />
      )}
    </div>
  );
}
