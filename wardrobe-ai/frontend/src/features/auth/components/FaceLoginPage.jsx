'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { LoginCameraView } from '@/features/auth/components/LoginCameraView';
import { VerificationLoader } from '@/features/auth/components/VerificationLoader';
import { AuthErrorFeedback } from '@/features/auth/components/AuthErrorFeedback';
import { CameraPermissionGate } from '@/features/auth/components/PermissionDeniedFallback';
import { useCamera } from '@/features/auth/hooks/useCamera';
import { useFaceLogin } from '@/features/auth/hooks/useFaceLogin';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export function FaceLoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const resetFaceLogin = useAuthStore((s) => s.resetFaceLogin);
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);

  const { videoRef, permission, error, isReady, startCamera, captureFrame } = useCamera();
  const { mutate: submitLogin, isPending, isError, error: loginError, reset } = useFaceLogin();

  const [isCapturing, setIsCapturing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(false);

  useEffect(() => {
    useProfileStore.persist.rehydrate();
    setProfileHydrated(true);
  }, []);

  useEffect(() => {
    if (!profileHydrated || !isAuthenticated) return;
    router.replace(onboardingComplete ? '/dashboard' : '/onboarding');
  }, [isAuthenticated, onboardingComplete, profileHydrated, router]);

  useEffect(() => {
    if (isError) {
      setShowError(true);
    }
  }, [isError]);

  const handleCaptureAndLogin = useCallback(async () => {
    setShowError(false);
    reset();
    resetFaceLogin();

    setIsCapturing(true);
    const blob = await captureFrame();
    setIsCapturing(false);

    if (!blob) return;

    submitLogin(blob, {
      onSuccess: () => {
        router.push(onboardingComplete ? '/dashboard' : '/onboarding');
      },
      onError: () => {
        setShowError(true);
      },
    });
  }, [captureFrame, submitLogin, reset, resetFaceLogin, router, onboardingComplete]);

  const handleRetry = useCallback(() => {
    setShowError(false);
    reset();
    resetFaceLogin();
  }, [reset, resetFaceLogin]);

  if (isPending) {
    return <VerificationLoader message="Matching your biometric profile…" />;
  }

  if (showError && loginError) {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl items-center overflow-y-auto px-4 py-8">
        <AuthErrorFeedback error={loginError} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col overflow-y-auto overflow-x-hidden px-4 py-4 sm:py-6">
      <header className="shrink-0 space-y-2 pb-4 text-center animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">
          Secure Access
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Face Login
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Sign in instantly with your registered biometric profile.
        </p>
      </header>

      <CameraPermissionGate
        permission={permission}
        error={error}
        isReady={isReady}
        onRequest={startCamera}
      >
        <div className="flex flex-col gap-4 pb-6">
          <LoginCameraView ref={videoRef} isReady={isReady} isScanning={isCapturing} />

          <div className="flex shrink-0 flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleCaptureAndLogin}
              disabled={!isReady || isCapturing || isPending}
              className="w-full gap-2 sm:w-auto sm:min-w-[220px]"
            >
              <ScanFace className="h-4 w-4" />
              {isCapturing ? 'Capturing…' : 'Verify & Sign In'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Ensure good lighting and a clear, front-facing view of your face.
            </p>
          </div>
        </div>
      </CameraPermissionGate>
    </div>
  );
}

export default FaceLoginPage;
