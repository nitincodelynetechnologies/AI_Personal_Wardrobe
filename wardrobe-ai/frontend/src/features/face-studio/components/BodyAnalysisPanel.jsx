'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Ruler, Upload, UserRound, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { formatLabel } from '@/features/dashboard/utils/dashboardUtils';
import { useCamera } from '@/features/auth/hooks/useCamera';
import {
  BODY_ANALYSIS_DURATION_MS,
  BODY_INPUT_METHODS,
  BODY_MEASUREMENTS,
  DEFAULT_BODY_PREVIEW_IMAGE,
  PRIMARY_BODY_TYPE,
} from '@/features/face-studio/constants/bodyAnalysisMockData';
import { VirtualAIFittingRoom } from '@/features/face-studio/components/VirtualAIFittingRoom';
import { readBodyScan, writeBodyScan } from '@/features/face-studio/utils/bodyScanStorage';

function MannequinWireframe() {
  return (
    <svg viewBox="0 0 120 280" className="h-40 w-auto text-emerald-400/40" aria-hidden>
      <ellipse cx="60" cy="28" rx="18" ry="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M 60 50 L 60 68 M 30 78 Q 60 62 90 78 M 38 78 L 32 130 M 88 78 L 92 130"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 48 130 L 42 230 M 72 130 L 78 230 M 42 230 L 36 268 M 78 230 L 84 268"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line x1="48" y1="130" x2="72" y2="130" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BodyStandbyPlaceholder() {
  return (
    <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 p-8 text-center opacity-90">
      <MannequinWireframe />
      <h4 className="mt-4 font-playfair text-lg font-semibold text-white">Awaiting Full-Body Scan</h4>
      <p className="mt-2 max-w-xs text-sm text-slate-400">
        Upload a full-body photo or record a walkaround video to extract physical biometrics and
        body type classification.
      </p>
    </div>
  );
}

function BodyScanningState() {
  return (
    <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
      <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-emerald-500" />
      <p className="animate-pulse font-medium text-emerald-400">Extracting body measurements…</p>
      <p className="mt-2 text-xs text-slate-500">Mapping skeletal proportions and silhouette vectors</p>
    </div>
  );
}

function BodyMeasurementsReport({ bodyType }) {
  const classifiedBodyType = bodyType ? formatLabel(bodyType) : PRIMARY_BODY_TYPE;

  return (
    <div className="animate-fade-in-view flex flex-col gap-6">
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
          Body Type Classification
        </p>
        <h2 className="font-playfair text-3xl font-black text-white">{classifiedBodyType}</h2>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Ruler className="h-4 w-4 text-emerald-400" aria-hidden />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Measurements Panel
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BODY_MEASUREMENTS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col rounded-lg border border-white/5 bg-white/5 p-3"
            >
              <span className="text-[10px] uppercase tracking-wider text-slate-400">{item.label}</span>
              <span className="mt-1 text-sm font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity className="h-4 w-4" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-widest">Fit Recommendation</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Tailored slim-athletic blocks with structured shoulders. Prioritize tapered jackets and
          mid-rise trousers for optimal proportion balance.
        </p>
      </div>
    </div>
  );
}

export function BodyAnalysisPanel() {
  const { userId, bodyType } = useAuthUser();
  const { videoRef, isReady, permission, error: cameraError, startCamera, stopCamera } = useCamera();
  const photoFileRef = useRef(null);
  const videoFileRef = useRef(null);

  const [inputMethod, setInputMethod] = useState(BODY_INPUT_METHODS.PHOTO);
  const [photoPreview, setPhotoPreview] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userBodyScan') || null;
  });
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [hasMedia, setHasMedia] = useState(false);
  const [isScanningBody, setIsScanningBody] = useState(false);
  const [isBodyAnalyzed, setIsBodyAnalyzed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Upload full-body media to begin');

  const isVideoMode = inputMethod === BODY_INPUT_METHODS.VIDEO;

  useEffect(() => {
    const storedScan = userId ? readBodyScan(userId) : null;

    setPhotoPreview(storedScan);
    setVideoPreviewUrl(null);
    setHasMedia(Boolean(storedScan));
    setIsBodyAnalyzed(false);
    setIsScanningBody(false);
    setStatusMessage(
      storedScan
        ? 'Restored saved body scan — ready for analysis'
        : 'Upload full-body media to begin',
    );
    stopCamera();
  }, [userId, stopCamera]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleInputMethodChange = useCallback(
    (method) => {
      setInputMethod(method);
      const storedScan = userId ? readBodyScan(userId) : null;

      setPhotoPreview(method === BODY_INPUT_METHODS.PHOTO ? storedScan : null);
      setVideoPreviewUrl(null);
      setHasMedia(method === BODY_INPUT_METHODS.PHOTO ? Boolean(storedScan) : false);
      setIsBodyAnalyzed(false);
      setIsScanningBody(false);
      setStatusMessage(
        method === BODY_INPUT_METHODS.VIDEO
          ? 'Record or upload a walkaround video'
          : storedScan
            ? 'Restored saved body scan — ready for analysis'
            : 'Upload a single full-body photo',
      );
      stopCamera();
    },
    [stopCamera, userId],
  );

  const handlePhotoUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
        setHasMedia(true);
        setIsBodyAnalyzed(false);
        setStatusMessage('Full-body photo loaded — ready for analysis');
        writeBodyScan(userId, reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }, [userId]);

  const handleVideoUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setHasMedia(true);
    setIsBodyAnalyzed(false);
    setStatusMessage('Walkaround video loaded — ready for analysis');
    stopCamera();
    event.target.value = '';
  }, [stopCamera]);

  const handleStartWalkaround = useCallback(async () => {
    setStatusMessage('Initializing walkaround camera…');
    await startCamera();
    setHasMedia(true);
    setStatusMessage('Walk in place — keep full body in frame');
  }, [startCamera]);

  const handleBodyAnalyze = useCallback(() => {
    if (!photoPreview && !videoPreviewUrl && !(isVideoMode && isReady)) {
      setPhotoPreview(DEFAULT_BODY_PREVIEW_IMAGE);
      setHasMedia(true);
    }

    setIsScanningBody(true);
    setIsBodyAnalyzed(false);
    setStatusMessage('Neural body analysis in progress…');

    window.setTimeout(() => {
      setIsScanningBody(false);
      setIsBodyAnalyzed(true);
      setStatusMessage('Physical biometrics report generated');
      stopCamera();
    }, BODY_ANALYSIS_DURATION_MS);
  }, [photoPreview, videoPreviewUrl, isVideoMode, isReady, stopCamera]);

  const displayPhoto = photoPreview;
  const userBodyImage = photoPreview || (isBodyAnalyzed ? DEFAULT_BODY_PREVIEW_IMAGE : null);

  return (
    <div className="animate-fade-in-view mx-auto mt-6 w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col rounded-2xl border border-white/10 bg-[#150d22] p-6 shadow-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold text-white">Body Analysis Engine</h3>
          <select
            value={inputMethod}
            onChange={(event) => handleInputMethodChange(event.target.value)}
            className="rounded-lg border border-white/10 bg-black/50 p-2 text-xs text-slate-300 outline-none ring-emerald-500/30 focus:ring-2"
            aria-label="Body input method"
          >
            <option value={BODY_INPUT_METHODS.PHOTO}>Single Full Body Photo</option>
            <option value={BODY_INPUT_METHODS.VIDEO}>Video Walkaround</option>
          </select>
        </div>

        <div className="relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-black/50">
          {isVideoMode ? (
            <>
              {videoPreviewUrl ? (
                <video
                  src={videoPreviewUrl}
                  className="absolute inset-0 h-full w-full object-contain"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      'absolute inset-0 h-full w-full scale-x-[-1] object-contain',
                      !isReady && 'opacity-0',
                    )}
                    aria-label="Walkaround video preview"
                  />
                  {!isReady && !videoPreviewUrl && (
                    <div className="z-10 flex flex-col items-center gap-3 p-6 text-center">
                      <Video className="h-10 w-10 text-emerald-400/70" />
                      <p className="text-sm text-slate-400">
                        {cameraError
                          ? 'Camera unavailable — upload a walkaround video instead.'
                          : 'Start walkaround capture or upload a video file.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : displayPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayPhoto}
              alt="Full body preview"
              className="absolute inset-0 h-full w-full object-contain opacity-90"
            />
          ) : (
            <div className="z-10 flex flex-col items-center gap-2 p-6 text-center">
              <UserRound className="h-10 w-10 text-slate-500" />
              <span className="text-sm text-slate-500">Upload full-body media</span>
            </div>
          )}

          {isScanningBody && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 animate-face-studio-scan bg-gradient-to-r from-transparent via-emerald-500 to-teal-400 shadow-[0_0_20px_#10b981]"
              aria-hidden
            />
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-obsidian/95 to-transparent p-3">
            <p className="text-center text-xs text-slate-400">{statusMessage}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {isVideoMode ? (
            <>
              {permission !== 'denied' && !videoPreviewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                  onClick={handleStartWalkaround}
                  disabled={isScanningBody}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Start Walkaround
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/10 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                onClick={() => videoFileRef.current?.click()}
                disabled={isScanningBody}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </Button>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10"
              onClick={() => photoFileRef.current?.click()}
              disabled={isScanningBody}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Full Body Photo
            </Button>
          )}
          {!isVideoMode && (
            <input
              ref={photoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleBodyAnalyze}
          disabled={isScanningBody}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-sm font-bold tracking-wide text-white transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-60"
        >
          {isScanningBody ? 'Extracting Measurements…' : 'Analyze Body Metrics'}
        </button>
      </div>

      <div className="flex min-h-[560px] flex-col rounded-2xl border border-white/10 bg-[#150d22] p-6 shadow-xl lg:min-h-0">
        <h3 className="mb-4 text-xl font-bold text-emerald-400">Physical Biometrics Report</h3>

        {!isBodyAnalyzed && !isScanningBody && <BodyStandbyPlaceholder />}

        {isScanningBody && <BodyScanningState />}

        {isBodyAnalyzed && !isScanningBody && <BodyMeasurementsReport bodyType={bodyType} />}
      </div>
      </div>

      {isBodyAnalyzed && !isScanningBody && (
        <VirtualAIFittingRoom userBodyImage={userBodyImage} />
      )}
    </div>
  );
}
