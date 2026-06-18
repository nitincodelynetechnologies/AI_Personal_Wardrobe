'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, RotateCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CameraViewfinder } from '@/features/auth/components/CameraViewfinder';
import { CaptureStepper } from '@/features/auth/components/CaptureStepper';
import { LivenessIndicator } from '@/features/auth/components/LivenessIndicator';
import { RegistrationSuccess } from '@/features/auth/components/RegistrationSuccess';
import { CameraPermissionGate } from '@/features/auth/components/PermissionDeniedFallback';
import { useCamera } from '@/features/auth/hooks/useCamera';
import { useCaptureFlow } from '@/features/auth/hooks/useCaptureFlow';
import { useLivenessDetection } from '@/features/auth/hooks/useLivenessDetection';
import { useFaceRegistration } from '@/features/auth/hooks/useFaceRegistration';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function FaceRegistrationPage() {
  const router = useRouter();
  const faceRegistrationStatus = useAuthStore((s) => s.faceRegistrationStatus);

  const { videoRef, permission, error, isReady, startCamera, captureFrame } = useCamera();
  const {
    currentStep,
    currentStepIndex,
    captures,
    captureError,
    isComplete,
    progress,
    saveCapture,
    resetCaptures,
  } = useCaptureFlow();

  const {
    checks,
    activeCheck,
    allComplete,
    faceError,
    resetLiveness,
    confirmBlink,
  } = useLivenessDetection({ videoRef, isActive: isReady && !isComplete });

  const { mutate: submitRegistration, isPending, isError, error: submitError } =
    useFaceRegistration();

  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (faceRegistrationStatus === 'success') {
      setShowSuccess(true);
    }
  }, [faceRegistrationStatus]);

  const handleCapture = useCallback(async () => {
    if (faceError?.includes('Multiple faces')) return;

    setIsCapturing(true);
    const blob = await captureFrame();
    setIsCapturing(false);

    if (blob) {
      await saveCapture(blob);
    }
  }, [captureFrame, saveCapture, faceError]);

  const handleSubmit = useCallback(() => {
    submitRegistration(
      {
        captures,
        livenessVerified: allComplete,
        singleFaceConfirmed: true,
      },
      {
        onSuccess: () => setShowSuccess(true),
      },
    );
  }, [captures, allComplete, submitRegistration]);

  const handleReset = useCallback(() => {
    resetCaptures();
    resetLiveness();
  }, [resetCaptures, resetLiveness]);

  const handleContinue = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  if (showSuccess) {
    return <RegistrationSuccess onContinue={handleContinue} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:space-y-8 sm:py-10">
      <header className="space-y-2 text-center animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">
          Biometric Onboarding
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
          Register Your Face
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Create your secure biometric profile for personalized styling and virtual try-on.
        </p>
      </header>

      <CameraPermissionGate
        permission={permission}
        error={error}
        isReady={isReady}
        onRequest={startCamera}
      >
        <div className="space-y-6">
          <CaptureStepper currentStepIndex={currentStepIndex} captures={captures} />

          <CameraViewfinder
            ref={videoRef}
            currentStep={currentStep}
            isReady={isReady}
          />

          <LivenessIndicator
            checks={checks}
            activeCheck={activeCheck}
            faceError={faceError}
            onConfirmBlink={confirmBlink}
          />

          {(captureError || (isError && submitError)) && (
            <Alert variant="destructive">
              {captureError || submitError?.message || 'Registration failed. Please try again.'}
            </Alert>
          )}

          {!isComplete ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={handleCapture}
                disabled={!isReady || isCapturing || faceError?.includes('Multiple faces')}
                className="w-full gap-2 sm:w-auto sm:min-w-[200px]"
              >
                <Camera className="h-4 w-4" />
                {isCapturing ? 'Capturing…' : `Capture ${currentStep?.shortLabel || 'Photo'}`}
              </Button>
              {Object.keys(captures).length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="w-full gap-2 sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  Start Over
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-white/5 bg-noir-elevated/50 p-4 sm:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ready to submit</span>
                  <span className="font-medium text-champagne">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isPending || !allComplete}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {isPending ? 'Securing Your Profile…' : 'Complete Registration'}
              </Button>

              {!allComplete && (
                <p className="text-center text-xs text-muted-foreground">
                  Complete all liveness checks before submitting.
                </p>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full text-muted-foreground"
              >
                Retake All Photos
              </Button>
            </div>
          )}
        </div>
      </CameraPermissionGate>
    </div>
  );
}
