'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FACE_DETECTION_INTERVAL_MS,
  FACE_DETECTION_MIN_SCORE,
  FACE_DETECTION_STABLE_FRAMES,
} from '@/features/auth/constants/captureSteps';
import {
  detectFacesInVideo,
  isFaceInOval,
  isFaceLargeEnough,
  loadFaceDetectionModels,
} from '@/features/auth/lib/faceDetectionEngine';

export function useFaceDetection({ videoRef, isActive }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading face detection…');
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState(null);
  const stableFramesRef = useRef(0);
  const detectingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    loadFaceDetectionModels()
      .then(() => {
        if (cancelled) return;
        setModelsReady(true);
        setStatusMessage('Center your face in the oval');
      })
      .catch((error) => {
        if (cancelled) return;
        setModelError(error instanceof Error ? error.message : 'Face detection unavailable');
        setStatusMessage('Face detection unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resetDetection = useCallback(() => {
    setIsVerified(false);
    setIsDetecting(false);
    setFaceCount(0);
    stableFramesRef.current = 0;
    setStatusMessage(modelsReady ? 'Center your face in the oval' : 'Loading face detection…');
  }, [modelsReady]);

  useEffect(() => {
    if (!isActive || !modelsReady || isVerified) {
      setIsDetecting(false);
      return undefined;
    }

    const video = videoRef?.current;
    if (!video) {
      return undefined;
    }

    setIsDetecting(true);
    let cancelled = false;

    const tick = async () => {
      if (cancelled || detectingRef.current) {
        return;
      }

      detectingRef.current = true;

      try {
        const valid = await detectFacesInVideo(video, FACE_DETECTION_MIN_SCORE);
        if (cancelled) return;

        setFaceCount(valid.length);

        if (valid.length === 0) {
          stableFramesRef.current = 0;
          setIsVerified(false);
          setStatusMessage('No face detected — center your face in the oval');
          return;
        }

        if (valid.length > 1) {
          stableFramesRef.current = 0;
          setIsVerified(false);
          setStatusMessage('Multiple faces detected — only one person allowed');
          return;
        }

        const detection = valid[0];

        if (!isFaceInOval(detection, video.videoWidth, video.videoHeight)) {
          stableFramesRef.current = 0;
          setIsVerified(false);
          setStatusMessage('Move your face into the oval');
          return;
        }

        if (!isFaceLargeEnough(detection, video.videoWidth)) {
          stableFramesRef.current = 0;
          setIsVerified(false);
          setStatusMessage('Move closer to the camera');
          return;
        }

        stableFramesRef.current += 1;

        if (stableFramesRef.current >= FACE_DETECTION_STABLE_FRAMES) {
          setIsVerified(true);
          setIsDetecting(false);
          setStatusMessage('Face detected — hold still');
          return;
        }

        setStatusMessage('Face aligned — hold still…');
      } catch {
        if (!cancelled) {
          stableFramesRef.current = 0;
          setIsVerified(false);
          setStatusMessage('Face detection error — retrying…');
        }
      } finally {
        detectingRef.current = false;
      }
    };

    tick();
    const intervalId = setInterval(tick, FACE_DETECTION_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      setIsDetecting(false);
    };
  }, [isActive, isVerified, modelsReady, videoRef]);

  return {
    isVerified,
    isDetecting,
    isVerifying: isDetecting && !isVerified,
    faceCount,
    statusMessage,
    modelsReady,
    modelError,
    resetDetection,
    allComplete: isVerified,
  };
}
