'use client';

import { useCallback, useEffect, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { useToastStore } from '@/components/ui/toaster';
import { CameraViewfinder } from '@/features/auth/components/CameraViewfinder';
import { LivenessIndicator } from '@/features/auth/components/LivenessIndicator';
import { RegistrationSubmitPanel } from '@/features/auth/components/RegistrationSubmitPanel';
import { RegistrationSuccess } from '@/features/auth/components/RegistrationSuccess';
import { CameraPermissionGate } from '@/features/auth/components/PermissionDeniedFallback';
import {
  AuthSplitShell,
  AUTH_FORM_CARD,
  AUTH_PRIMARY_BUTTON,
} from '@/features/auth/components/AuthSplitShell';
import { useCamera } from '@/features/auth/hooks/useCamera';
import { useCaptureFlow } from '@/features/auth/hooks/useCaptureFlow';
import { useFaceDetection } from '@/features/auth/hooks/useFaceDetection';
import { useFaceRegistration } from '@/features/auth/hooks/useFaceRegistration';
import { ApiError, getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

function getRegistrationErrorMessage(error) {
  if (error instanceof ApiError && error.status === 400) {
    return error.message;
  }
  return getNetworkErrorMessage(error);
}

export function FaceRegistrationPage() {
  const showToast = useToastStore((s) => s.showToast);
  const faceRegistrationStatus = useAuthStore((s) => s.faceRegistrationStatus);

  const { videoRef, permission, error, isReady, startCamera, captureFrame } = useCamera();
  const { captures, captureError, isComplete, saveCapture, resetCaptures } = useCaptureFlow();

  const {
    isVerified,
    isVerifying,
    statusMessage,
    modelsReady,
    modelError,
    resetDetection,
  } = useFaceDetection({
    videoRef,
    isActive: isReady && !isComplete,
  });

  const { mutate: submitRegistration, isPending, isError, error: submitError } =
    useFaceRegistration();

  const [isCapturing, setIsCapturing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [faceVerifiedAtCapture, setFaceVerifiedAtCapture] = useState(false);

  useEffect(() => {
    if (faceRegistrationStatus === 'success') {
      setShowSuccess(true);
    }
  }, [faceRegistrationStatus]);

  useEffect(() => {
    if (isError && submitError) {
      const message = getRegistrationErrorMessage(submitError);
      showToast({ message, variant: 'destructive' });
    }
  }, [isError, submitError, showToast]);

  const handleCapture = useCallback(async () => {
    if (!isVerified || !modelsReady) {
      showToast({
        message: 'Position exactly one face in the oval before capturing.',
        variant: 'destructive',
      });
      return;
    }

    setIsCapturing(true);
    const blob = await captureFrame();
    setIsCapturing(false);

    if (blob) {
      setFaceVerifiedAtCapture(true);
      await saveCapture(blob);
    }
  }, [captureFrame, saveCapture, isVerified, modelsReady, showToast]);

  const handleSubmit = useCallback(() => {
    submitRegistration(
      {
        captures,
        livenessVerified: faceVerifiedAtCapture,
        userDetails: { email, password },
      },
      {
        onSuccess: () => setShowSuccess(true),
        onError: (registrationError) => {
          showToast({
            message: getRegistrationErrorMessage(registrationError),
            variant: 'destructive',
          });
        },
      },
    );
  }, [captures, faceVerifiedAtCapture, email, password, submitRegistration, showToast]);

  const handleReset = useCallback(() => {
    resetCaptures();
    resetDetection();
    setFaceVerifiedAtCapture(false);
  }, [resetCaptures, resetDetection]);

  const submitErrorMessage = isError && submitError ? getRegistrationErrorMessage(submitError) : null;

  if (showSuccess) {
    return <RegistrationSuccess />;
  }

  return (
    <AuthSplitShell variant="register">
      <div className={`${AUTH_FORM_CARD} max-h-[85dvh] space-y-8 overflow-y-auto`}>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-sm text-slate-700 dark:text-gray-400">
            Register your face profile and set up your virtual wardrobe.
          </p>
        </header>

        <CameraPermissionGate
          purpose="register"
          permission={permission}
          error={error}
          isReady={isReady}
          onRequest={startCamera}
        >
          <div className="flex flex-col gap-6">
            <div className="border border-borderColor rounded-xl overflow-hidden shadow-sm">
              <CameraViewfinder
                ref={videoRef}
                isReady={isReady}
                isVerified={isVerified}
                statusMessage={modelError || statusMessage}
              />
            </div>

            {!isComplete && (
              <LivenessIndicator
                isVerified={isVerified}
                isVerifying={isVerifying}
                statusMessage={modelError || statusMessage}
              />
            )}

            {(captureError || submitErrorMessage) && (
              <Alert variant="destructive" role="alert" className="rounded-none border-l-2">
                {captureError || submitErrorMessage}
              </Alert>
            )}

            {!isComplete ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isReady || !modelsReady || !isVerified || isCapturing}
                className={AUTH_PRIMARY_BUTTON}
              >
                <Camera className="h-4 w-4" />
                {isCapturing
                  ? 'Capturing'
                  : isVerified
                    ? 'Capture Front Face'
                    : 'Waiting for face'}
              </button>
            ) : (
              <RegistrationSubmitPanel
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
                isPending={isPending}
                disabled={!faceVerifiedAtCapture}
              />
            )}

            {isComplete && (
              <button
                type="button"
                onClick={handleReset}
                className="mx-auto inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Photo
              </button>
            )}
          </div>
        </CameraPermissionGate>
      </div>
    </AuthSplitShell>
  );
}

export default FaceRegistrationPage;
