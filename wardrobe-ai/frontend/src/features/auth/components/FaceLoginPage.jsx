'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScanFace } from 'lucide-react';
import { LoginCameraView } from '@/features/auth/components/LoginCameraView';
import { AuthErrorFeedback } from '@/features/auth/components/AuthErrorFeedback';
import { EmailPasswordLoginForm } from '@/features/auth/components/EmailPasswordLoginForm';
import { CameraPermissionGate } from '@/features/auth/components/PermissionDeniedFallback';
import {
  AuthSplitShell,
  AUTH_FORM_CARD,
  AUTH_SECONDARY_BUTTON,
} from '@/features/auth/components/AuthSplitShell';
import { useToastStore } from '@/components/ui/toaster';
import { useCamera } from '@/features/auth/hooks/useCamera';
import { useFaceDetection } from '@/features/auth/hooks/useFaceDetection';
import { useFaceLogin } from '@/features/auth/hooks/useFaceLogin';
import { getFaceLoginErrorMessage } from '@/features/auth/components/AuthErrorFeedback';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import {
  getPostLoginPath,
  rehydrateAuthStores,
  syncProfileFromServer,
} from '@/features/profile/utils/profileSync';

const FACE_LOGIN_TIMEOUT_MS = 10000;
const FACE_LOGIN_WATCHDOG_MS = FACE_LOGIN_TIMEOUT_MS + 2000;

export function FaceLoginPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const resetFaceLogin = useAuthStore((s) => s.resetFaceLogin);
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);

  const { videoRef, permission, error, isReady, startCamera, stopCamera, captureFrame } =
    useCamera();
  const { mutate: submitLogin, isPending, error: loginError, reset } = useFaceLogin();

  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [fallbackError, setFallbackError] = useState(null);
  const [loginBlocked, setLoginBlocked] = useState(false);
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
    isActive:
      showCamera && isReady && !isVerifyingApi && !showError && !loginBlocked,
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
    let cancelled = false;

    async function bootstrap() {
      await rehydrateAuthStores();

      const token = useAuthStore.getState().accessToken;
      const authed = useAuthStore.getState().isAuthenticated;
      if (!authed || !token || cancelled) return;

      try {
        const { onboardingComplete: complete } = await syncProfileFromServer(token);
        if (!cancelled) router.replace(getPostLoginPath(complete));
      } catch {
        if (!cancelled) router.replace(getPostLoginPath(onboardingComplete));
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, router, onboardingComplete]);

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
      onSuccess: async (data) => {
        const token = data.jwt_token ?? useAuthStore.getState().accessToken;
        try {
          const { onboardingComplete: complete } = token
            ? await syncProfileFromServer(token)
            : { onboardingComplete: false };
          router.push(getPostLoginPath(complete));
        } catch {
          router.push('/onboarding');
        }
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
    notifyError,
  ]);

  useEffect(() => {
    if (
      !showCamera ||
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
  }, [
    showCamera,
    isVerified,
    modelsReady,
    loginBlocked,
    showError,
    isVerifyingApi,
    performLogin,
  ]);

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

  const handleOpenFaceLogin = () => {
    setShowCamera(true);
    handleRetry();
  };

  const handleCloseFaceLogin = useCallback(() => {
    setShowCamera(false);
    stopCamera();
    handleRetry();
  }, [stopCamera, handleRetry]);

  const activeError = loginError || fallbackError;

  const cameraStatusMessage =
    isReady && !modelError ? statusMessage : modelError || undefined;

  return (
    <AuthSplitShell variant="login">
      {!showCamera ? (
        <div className={`${AUTH_FORM_CARD} space-y-8`}>
          <header className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-sm text-slate-700 dark:text-gray-400">Sign in to your account</p>
          </header>

          <EmailPasswordLoginForm />

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-borderColor" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#150d22] px-4 text-xs text-slate-700 dark:text-gray-400">OR</span>
            </div>
          </div>

          <button type="button" onClick={handleOpenFaceLogin} className={`${AUTH_SECONDARY_BUTTON} mt-4`}>
            <ScanFace className="h-4 w-4" />
            Login with Face
          </button>
        </div>
      ) : (
        <div className={`${AUTH_FORM_CARD} space-y-6`}>
          <button
            type="button"
            onClick={handleCloseFaceLogin}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Email
          </button>

          <header className="space-y-2">
            <h1 className="font-playfair text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Login with Face
            </h1>
            <p className="font-sans text-sm text-slate-700 dark:text-gray-400">
              Center one face in the frame. Verification begins automatically.
            </p>
          </header>

          <div className="overflow-hidden rounded-2xl border border-borderColor">
            <CameraPermissionGate
              purpose="login"
              permission={permission}
              error={error}
              isReady={isReady}
              onRequest={startCamera}
            >
              <div className="flex flex-col">
                <LoginCameraView
                  ref={videoRef}
                  isReady={isReady}
                  isVerified={isVerified && !loginBlocked}
                  isLivenessPending={isLivenessPending && !loginBlocked}
                  isVerifying={isVerifyingApi}
                  statusMessage={cameraStatusMessage}
                />

                {showError && activeError && (
                  <div className="border-t border-borderColor bg-white dark:bg-[#150d22] p-4">
                    <AuthErrorFeedback
                      error={activeError}
                      onRetry={handleRetry}
                      onUseEmail={handleCloseFaceLogin}
                    />
                  </div>
                )}
              </div>
            </CameraPermissionGate>
          </div>
        </div>
      )}
    </AuthSplitShell>
  );
}

export default FaceLoginPage;
