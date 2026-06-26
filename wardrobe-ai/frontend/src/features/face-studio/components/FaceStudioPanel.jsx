'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, CheckCircle2, Radar, ScanFace, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useCamera } from '@/features/auth/hooks/useCamera';
import {
  DEFAULT_USER_FACE_URL,
  useFaceStudioStore,
} from '@/features/face-studio/store/useFaceStudioStore';
import { FaceAnalysisDashboard } from '@/features/face-studio/components/FaceAnalysisDashboard';
import { runBiometricAnalysis } from '@/features/face-studio/utils/runBiometricAnalysis';

const CAPTURE_SCAN_DURATION_MS = 2200;

function CornerBracket({ className }) {
  return (
    <span
      className={cn('pointer-events-none absolute h-8 w-8 border-magenta', className)}
      aria-hidden
    />
  );
}

function captureVideoFrame(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

function BiometricStandbyPlaceholder() {
  return (
    <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <Radar className="relative h-14 w-14 text-fuchsia-400/70" strokeWidth={1.25} aria-hidden />
        <ScanFace className="absolute h-10 w-10 text-white/25" strokeWidth={1} aria-hidden />
      </div>
      <h4 className="font-playfair text-lg font-semibold text-white">System Standby</h4>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
        Awaiting biometric data… Upload or capture a face to generate your personalized styling
        report.
      </p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
        Face shape · Skin undertone · Style metrics
      </p>
    </div>
  );
}

function BiometricScanningState() {
  return (
    <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-8 text-center">
      <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-fuchsia-500" />
      <p className="animate-pulse font-medium text-fuchsia-400">Neural processing in progress…</p>
      <p className="mt-2 text-xs text-slate-500">Extracting morphology, dermis mapping, and style vectors</p>
    </div>
  );
}

function BiometricSummaryCards({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
        <span className="text-sm text-slate-400">Face Shape</span>
        <span className="font-semibold text-white">{analysis.faceShape}</span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
        <span className="text-sm text-slate-400">Skin Undertone</span>
        <span className="font-semibold text-white">{analysis.skinTone}</span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
        <span className="text-sm text-slate-400">Hair Profile</span>
        <span className="font-semibold text-white">{analysis.hairProfile}</span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
        <span className="text-sm text-slate-400">Beard Match</span>
        <span className="font-semibold text-white">{analysis.beardMatch}</span>
      </div>
    </div>
  );
}

export function FaceStudioPanel() {
  const { userId, avatarUrl } = useAuthUser();
  const storedUserFace = useFaceStudioStore((state) => state.userFace);
  const boundUserId = useFaceStudioStore((state) => state.boundUserId);
  const setUserFace = useFaceStudioStore((state) => state.setUserFace);
  const clearUserFace = useFaceStudioStore((state) => state.clearUserFace);

  const userFace = boundUserId === userId ? storedUserFace : null;
  const sessionAvatar = boundUserId === userId ? userFace || avatarUrl : avatarUrl;

  const { videoRef, isReady, permission, error: cameraError, startCamera, stopCamera } = useCamera();
  const fileInputRef = useRef(null);
  const analysisCanvasRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Align your face within the targeting frame');
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [biometricData, setBiometricData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const isCaptureScanning = phase === 'capture-scanning';
  const isFaceCaptured = phase === 'captured' || phase === 'analyzed' || Boolean(sessionAvatar);
  const showScanLine = isCaptureScanning || isScanning;

  useEffect(() => {
    setPreviewUrl(null);
    setPhase(sessionAvatar ? 'captured' : 'idle');
    setIsScanning(false);
    setIsAnalyzed(false);
    setBiometricData(null);
    setAnalysisError(null);
    setStatusMessage(
      sessionAvatar
        ? 'Face captured — run biometric analysis to generate your report'
        : 'Align your face within the targeting frame',
    );
  }, [userId, sessionAvatar]);

  const handleStartCamera = useCallback(async () => {
    setStatusMessage('Initializing biometric scanner…');
    await startCamera();
    setStatusMessage('Align your face within the targeting frame');
  }, [startCamera]);

  const finishCapture = useCallback(
    (faceUrl) => {
      setPreviewUrl(faceUrl);
      setUserFace(faceUrl, userId);
      setPhase('captured');
      setIsAnalyzed(false);
      setIsScanning(false);
      setStatusMessage('Face captured — run biometric analysis to generate your report');
      stopCamera();
    },
    [setUserFace, stopCamera, userId],
  );

  const runCaptureScan = useCallback(
    (faceUrl) => {
      setPhase('capture-scanning');
      setStatusMessage('Scanning facial geometry…');

      window.setTimeout(() => {
        finishCapture(faceUrl);
      }, CAPTURE_SCAN_DURATION_MS);
    },
    [finishCapture],
  );

  const handleCapture = useCallback(() => {
    if (isCaptureScanning || isScanning) return;

    let faceUrl = DEFAULT_USER_FACE_URL;

    if (isReady && videoRef.current?.videoWidth) {
      const captured = captureVideoFrame(videoRef.current);
      if (captured) faceUrl = captured;
    }

    runCaptureScan(faceUrl);
  }, [isReady, isCaptureScanning, isScanning, runCaptureScan, videoRef]);

  const handleFileUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          runCaptureScan(reader.result);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    },
    [runCaptureScan],
  );

  const handleAnalyzeClick = useCallback(async () => {
    const userFaceUrl = previewUrl || sessionAvatar;
    if (!userFaceUrl) return;

    setIsScanning(true);
    setIsAnalyzed(false);
    setAnalysisError(null);
    setPhase('analyzed');
    setStatusMessage('Neural face analysis in progress…');

    try {
      const result = await runBiometricAnalysis(userFaceUrl, analysisCanvasRef.current);
      setBiometricData(result);
      setStatusMessage('Biometric analysis complete — HUD report generated');
    } catch (error) {
      console.error('AI Analysis Failed', error);
      setAnalysisError(error instanceof Error ? error.message : 'Biometric analysis failed');
      setStatusMessage('Analysis failed — please recapture and try again');
    } finally {
      setIsScanning(false);
      setIsAnalyzed(true);
    }
  }, [previewUrl, sessionAvatar]);

  const handleReset = useCallback(() => {
    clearUserFace();
    setPreviewUrl(null);
    setPhase('idle');
    setIsScanning(false);
    setIsAnalyzed(false);
    setBiometricData(null);
    setAnalysisError(null);
    setStatusMessage('Align your face within the targeting frame');
    handleStartCamera();
  }, [clearUserFace, handleStartCamera]);

  const displayFace = previewUrl || sessionAvatar;

  return (
    <div className="animate-fade-in-view mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
      <canvas ref={analysisCanvasRef} className="hidden" aria-hidden />
      <div className="flex flex-col rounded-2xl border border-white/10 bg-[#150d22] p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-white">Face Capture Scanner</h3>

        <div className="relative h-[400px] w-full overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-black/50">
          <CornerBracket className="left-3 top-3 z-10 border-l-2 border-t-2" />
          <CornerBracket className="right-3 top-3 z-10 border-r-2 border-t-2" />
          <CornerBracket className="bottom-3 left-3 z-10 border-b-2 border-l-2" />
          <CornerBracket className="bottom-3 right-3 z-10 border-b-2 border-r-2" />

          {displayFace && isFaceCaptured ? (
            <img
              src={displayFace}
              alt="Face preview"
              className="absolute inset-0 h-full w-full scale-x-[-1] object-cover opacity-90"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  'absolute inset-0 h-full w-full scale-x-[-1] object-cover',
                  !isReady && 'opacity-0',
                )}
                aria-label="Webcam preview for face capture"
              />

              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-magenta/30 bg-magenta/10">
                    <ScanFace className="h-8 w-8 text-amber-400" />
                  </div>
                  <p className="text-sm text-slate-400">
                    {cameraError
                      ? 'Camera unavailable — capture will use a demo portrait.'
                      : 'Activate the scanner to begin face mapping.'}
                  </p>
                  {permission !== 'denied' && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-magenta/40 text-magenta hover:bg-magenta/10"
                      onClick={handleStartCamera}
                    >
                      Activate Scanner
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian/70" />

          {showScanLine && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 animate-face-studio-scan bg-gradient-to-r from-transparent via-fuchsia-500 to-pink-500 shadow-[0_0_20px_#ec4899]"
              aria-hidden
            />
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-obsidian/95 to-transparent p-4">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
              {isScanning
                ? 'Biometric analysis'
                : isCaptureScanning
                  ? 'Biometric capture'
                  : 'Targeting grid active'}
            </p>
            <p className="mt-1 text-center text-xs text-slate-300">{statusMessage}</p>
          </div>
        </div>

        {isFaceCaptured && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge className="border border-emerald-400/40 bg-emerald-500/15 px-4 py-1.5 text-emerald-300">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Face Biometrics Saved
            </Badge>
            {isAnalyzed && (
              <Badge className="border border-magenta/40 bg-magenta/10 px-4 py-1.5 text-magenta">
                <BrainCircuit className="mr-1.5 h-3.5 w-3.5" />
                AI Analysis Complete
              </Badge>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {!isFaceCaptured ? (
            <>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCaptureScanning}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 py-4 text-sm font-bold tracking-wide text-white transition-all hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-60"
              >
                <ScanFace className="h-4 w-4" />
                Capture Face Profile
              </button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/10 text-slate-300 hover:border-violet/40 hover:bg-violet/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCaptureScanning}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAnalyzeClick}
                disabled={isScanning || !displayFace}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 py-4 text-sm font-bold tracking-wide text-white transition-all hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-60"
              >
                <BrainCircuit className="h-4 w-4" />
                {isScanning ? 'Extracting Biometrics…' : 'Run Biometric Analysis'}
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10 text-slate-300 hover:border-magenta/40 hover:bg-magenta/10"
                  onClick={handleReset}
                  disabled={isScanning}
                >
                  Recapture Profile
                </Button>
                {isAnalyzed && (
                  <Button asChild className="flex-1 bg-violet hover:bg-violet/80">
                    <Link href="/catalog">Try On in Catalog</Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-[560px] flex-col rounded-2xl border border-white/10 bg-[#150d22] p-6 shadow-xl lg:min-h-0">
        <h3 className="mb-4 text-xl font-bold text-fuchsia-400">Biometric Intelligence Report</h3>

        {!isAnalyzed && !isScanning && <BiometricStandbyPlaceholder />}

        {isScanning && <BiometricScanningState />}

        {isAnalyzed && !isScanning && (
          <div className="animate-fade-in-view flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {analysisError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {analysisError}
              </p>
            )}
            {biometricData ? (
              <>
                <BiometricSummaryCards analysis={biometricData} />
                <FaceAnalysisDashboard embedded className="min-h-0 flex-1" analysis={biometricData} />
              </>
            ) : !analysisError ? (
              <BiometricStandbyPlaceholder />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
