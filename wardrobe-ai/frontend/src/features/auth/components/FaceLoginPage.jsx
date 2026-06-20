'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { LoginCameraView } from '@/features/auth/components/LoginCameraView';
import { AuthErrorFeedback } from '@/features/auth/components/AuthErrorFeedback';
import { EmailPasswordLoginForm } from '@/features/auth/components/EmailPasswordLoginForm';
import { CameraPermissionGate } from '@/features/auth/components/PermissionDeniedFallback';
import { useToastStore } from '@/components/ui/toaster';
import { useCamera } from '@/features/auth/hooks/useCamera';
import { useFaceDetection } from '@/features/auth/hooks/useFaceDetection';
import { useFaceLogin } from '@/features/auth/hooks/useFaceLogin';
import { getFaceLoginErrorMessage } from '@/features/auth/components/AuthErrorFeedback';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

const FACE_LOGIN_TIMEOUT_MS = 10000;
const FACE_LOGIN_WATCHDOG_MS = FACE_LOGIN_TIMEOUT_MS + 2000;

export function FaceLoginPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const resetFaceLogin = useAuthStore((s) => s.resetFaceLogin);
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);

  const { videoRef, permission, error, isReady, startCamera, captureFrame } = useCamera();
  const { mutate: submitLogin, isPending, error: loginError, reset } = useFaceLogin();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [fallbackError, setFallbackError] = useState(null);
  const [loginBlocked, setLoginBlocked] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const autoSubmitStarted = useRef(false);
  const lastToastMessage = useRef(null);

  const isVerifyingApi = isPending || isSubmitting;

  const {
    isVerified,
    isVerifying: isLivenessPending,
    statusMessage,
    modelsReady,
    modelError,
    resetDetection,
  } = useFaceDetection({
    videoRef,
    isActive: isReady && !isVerifyingApi && !showError && !loginBlocked,
  });

  const notifyError = useCallback(
    (err) => {
      const message = getFaceLoginErrorMessage(err);
      setShowError(true);
      setLoginBlocked(true);
      resetDetection();

      if (lastToastMessage.current !== message) {
        lastToastMessage.current = message;
        showToast({ message, variant: 'destructive' });
      }
    },
    [resetDetection, showToast],
  );

  useEffect(() => {
    useProfileStore.persist.rehydrate();
    setProfileHydrated(true);
  }, []);

  useEffect(() => {
    if (!profileHydrated || !isAuthenticated) return;
    router.replace(onboardingComplete ? '/dashboard' : '/onboarding');
  }, [isAuthenticated, onboardingComplete, profileHydrated, router]);

  useEffect(() => {
    if (!isVerifyingApi) return undefined;

    const watchdog = setTimeout(() => {
      setIsSubmitting(false);
      autoSubmitStarted.current = true;
      setFallbackError(new Error('Request timed out. Please try again.'));
      notifyError(new Error('Request timed out. Please try again.'));
      reset();
      resetFaceLogin();
    }, FACE_LOGIN_WATCHDOG_MS);

    return () => clearTimeout(watchdog);
  }, [isVerifyingApi, reset, resetFaceLogin, notifyError]);

  const performLogin = useCallback(async () => {
    if (!isVerified || loginBlocked) {
      return;
    }

    setIsSubmitting(true);

    const blob = await captureFrame();
    if (!blob) {
      setIsSubmitting(false);
      autoSubmitStarted.current = false;
      return;
    }

    submitLogin(blob, {
      onSuccess: () => {
        router.push(onboardingComplete ? '/dashboard' : '/onboarding');
      },
      onError: (submitErr) => {
        autoSubmitStarted.current = true;
        notifyError(submitErr);
      },
      onSettled: (_data, submitErr) => {
        setIsSubmitting(false);
        if (!submitErr) {
          autoSubmitStarted.current = false;
        }
      },
    });
  }, [
    isVerified,
    loginBlocked,
    captureFrame,
    submitLogin,
    router,
    onboardingComplete,
    notifyError,
  ]);

  useEffect(() => {
    if (
      !isVerified ||
      !modelsReady ||
      loginBlocked ||
      showError ||
      autoSubmitStarted.current ||
      isVerifyingApi
    ) {
      return;
    }

    autoSubmitStarted.current = true;
    performLogin();
  }, [isVerified, modelsReady, loginBlocked, showError, isVerifyingApi, performLogin]);

  const handleRetry = useCallback(() => {
    setShowError(false);
    setFallbackError(null);
    setLoginBlocked(false);
    setIsSubmitting(false);
    autoSubmitStarted.current = false;
    lastToastMessage.current = null;
    reset();
    resetFaceLogin();
    resetDetection();
  }, [reset, resetFaceLogin, resetDetection]);

  const activeError = loginError || fallbackError;

  const cameraStatusMessage =
    isReady && !modelError ? statusMessage : modelError || undefined;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <header className="space-y-2 text-center animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Secure Access</p>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Face Login
        </h1>
        <p className="text-sm text-muted-foreground">
          Center exactly one face in the oval. When the border turns green, we sign you in
          automatically.
        </p>
      </header>

      <Card className="overflow-hidden border-border shadow-md">
        <CardContent className="p-0">
          <CameraPermissionGate
            purpose="login"
            permission={permission}
            error={error}
            isReady={isReady}
            onRequest={startCamera}
          >
            <div className="flex flex-col gap-4">
              <LoginCameraView
                ref={videoRef}
                isReady={isReady}
                isVerified={isVerified && !loginBlocked}
                isLivenessPending={isLivenessPending && !loginBlocked}
                isVerifying={isVerifyingApi}
                statusMessage={cameraStatusMessage}
              />

              {showError && activeError && (
                <div className="px-4 pb-4">
                  <AuthErrorFeedback error={activeError} onRetry={handleRetry} />
                </div>
              )}
            </div>
          </CameraPermissionGate>
        </CardContent>
      </Card>

      <div className="space-y-4" id="email-login">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-background px-3 text-muted-foreground">Or</span>
          </div>
        </div>

        <EmailPasswordLoginForm />
      </div>
    </div>
  );
}

export default FaceLoginPage;
