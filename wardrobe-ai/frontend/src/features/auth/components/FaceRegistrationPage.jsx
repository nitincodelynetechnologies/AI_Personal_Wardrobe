'use client';

import { useCallback, useEffect, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { CameraViewfinder } from '@/features/auth/components/CameraViewfinder';
import { LivenessIndicator } from '@/features/auth/components/LivenessIndicator';
import { RegistrationSubmitPanel } from '@/features/auth/components/RegistrationSubmitPanel';
import { RegistrationSuccess } from '@/features/auth/components/RegistrationSuccess';
import { CameraPermissionGate } from '@/features/auth/components/PermissionDeniedFallback';
import { useCamera } from '@/features/auth/hooks/useCamera';
import { useCaptureFlow } from '@/features/auth/hooks/useCaptureFlow';
import { useLivenessDetection } from '@/features/auth/hooks/useLivenessDetection';
import { useFaceRegistration } from '@/features/auth/hooks/useFaceRegistration';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function FaceRegistrationPage() {
  const faceRegistrationStatus = useAuthStore((s) => s.faceRegistrationStatus);

  const { videoRef, permission, error, isReady, startCamera, captureFrame } = useCamera();
  const { captures, captureError, isComplete, saveCapture, resetCaptures } = useCaptureFlow();
  const { isVerified, isVerifying, allComplete, resetLiveness } = useLivenessDetection({
    isActive: isComplete,
  });

  const { mutate: submitRegistration, isPending, isError, error: submitError } =
    useFaceRegistration();

  const [isCapturing, setIsCapturing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (faceRegistrationStatus === 'success') {
      setShowSuccess(true);
    }
  }, [faceRegistrationStatus]);

  const handleCapture = useCallback(async () => {
    setIsCapturing(true);
    const blob = await captureFrame();
    setIsCapturing(false);

    if (blob) {
      await saveCapture(blob);
    }
  }, [captureFrame, saveCapture]);

  const handleSubmit = useCallback(() => {
    submitRegistration(
      {
        captures,
        livenessVerified: allComplete,
        userDetails: { email, password },
      },
      {
        onSuccess: () => setShowSuccess(true),
      },
    );
  }, [captures, allComplete, email, password, submitRegistration]);

  const handleReset = useCallback(() => {
    resetCaptures();
    resetLiveness();
  }, [resetCaptures, resetLiveness]);

  const submitErrorMessage = isError && submitError ? getNetworkErrorMessage(submitError) : null;

  if (showSuccess) {
    return <RegistrationSuccess />;
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col overflow-y-auto overflow-x-hidden px-4 py-4 sm:py-6">
      <header className="shrink-0 space-y-2 pb-4 text-center animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">
          Biometric Onboarding
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Register Your Face
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Capture one front-facing photo to create your secure biometric profile.
        </p>
      </header>

      <CameraPermissionGate
        permission={permission}
        error={error}
        isReady={isReady}
        onRequest={startCamera}
      >
        <div className="flex flex-col gap-4 pb-6">
          <CameraViewfinder ref={videoRef} isReady={isReady} isVerified={isVerified} />

          <LivenessIndicator isVerified={isVerified} isVerifying={isVerifying} />

          {(captureError || submitErrorMessage) && (
            <Alert variant="destructive" role="alert">
              {captureError || submitErrorMessage}
            </Alert>
          )}

          {!isComplete ? (
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={handleCapture}
                disabled={!isReady || isCapturing}
                className="w-full gap-2 sm:w-auto sm:min-w-[200px]"
              >
                <Camera className="h-4 w-4" />
                {isCapturing ? 'Capturing…' : 'Capture Front Face'}
              </Button>
            </div>
          ) : allComplete ? (
            <RegistrationSubmitPanel
              email={email}
              password={password}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              isPending={isPending}
              disabled={!allComplete}
            />
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Verifying liveness…
            </p>
          )}

          {isComplete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="mx-auto gap-2 text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Photo
            </Button>
          )}
        </div>
      </CameraPermissionGate>
    </div>
  );
}

export default FaceRegistrationPage;
