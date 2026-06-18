'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LIVENESS_CHECKS } from '@/features/auth/constants/captureSteps';

const MOTION_THRESHOLD = 12;
const BLINK_COOLDOWN_MS = 800;
const SAMPLE_INTERVAL_MS = 120;

function getFrameBrightness(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;
  let sum = 0;
  const step = 16;
  for (let i = 0; i < data.length; i += 4 * step) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  return sum / (data.length / (4 * step));
}

function getCenterRegionBrightness(ctx, width, height) {
  const regionW = Math.floor(width * 0.4);
  const regionH = Math.floor(height * 0.3);
  const startX = Math.floor((width - regionW) / 2);
  const startY = Math.floor(height * 0.2);
  const data = ctx.getImageData(startX, startY, regionW, regionH).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  return sum / (data.length / 4);
}

export function useLivenessDetection({ videoRef, isActive }) {
  const canvasRef = useRef(null);
  const prevBrightnessRef = useRef(null);
  const prevCenterBrightnessRef = useRef(null);
  const lastBlinkRef = useRef(0);
  const motionSamplesRef = useRef([]);

  const [checks, setChecks] = useState(() =>
    Object.fromEntries(LIVENESS_CHECKS.map((c) => [c.id, false])),
  );
  const [activeCheck, setActiveCheck] = useState('blink');
  const [faceCount, setFaceCount] = useState(0);
  const [faceError, setFaceError] = useState(null);

  const allComplete = Object.values(checks).every(Boolean);

  const detectFaces = useCallback(async (video) => {
    if (typeof window === 'undefined' || !window.FaceDetector) {
      setFaceCount(1);
      setFaceError(null);
      return 1;
    }

    try {
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
      const faces = await detector.detect(video);
      const count = faces.length;
      setFaceCount(count);

      if (count === 0) {
        setFaceError('No face detected. Please center your face in the frame.');
      } else if (count > 1) {
        setFaceError('Multiple faces detected. Only one person should be in the frame.');
      } else {
        setFaceError(null);
      }

      return count;
    } catch {
      setFaceCount(1);
      setFaceError(null);
      return 1;
    }
  }, []);

  const analyzeFrame = useCallback(async () => {
    const video = videoRef?.current;
    if (!video || !isActive || video.readyState < 2) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0);

    await detectFaces(video);

    const brightness = getFrameBrightness(ctx, canvas.width, canvas.height);
    const centerBrightness = getCenterRegionBrightness(ctx, canvas.width, canvas.height);

    if (prevBrightnessRef.current !== null) {
      const motionDelta = Math.abs(brightness - prevBrightnessRef.current);
      motionSamplesRef.current.push(motionDelta);
      if (motionSamplesRef.current.length > 8) {
        motionSamplesRef.current.shift();
      }

      const avgMotion =
        motionSamplesRef.current.reduce((a, b) => a + b, 0) /
        motionSamplesRef.current.length;

      if (avgMotion > MOTION_THRESHOLD && !checks.headMovement) {
        setChecks((prev) => ({ ...prev, headMovement: true }));
        setActiveCheck('headMovement');
      }
    }

    if (prevCenterBrightnessRef.current !== null) {
      const eyeRegionDelta = Math.abs(centerBrightness - prevCenterBrightnessRef.current);
      const now = Date.now();

      if (
        eyeRegionDelta > 8 &&
        now - lastBlinkRef.current > BLINK_COOLDOWN_MS &&
        !checks.blink
      ) {
        lastBlinkRef.current = now;
        setChecks((prev) => ({ ...prev, blink: true }));
        if (!checks.headMovement) {
          setActiveCheck('headMovement');
        }
      }
    }

    prevBrightnessRef.current = brightness;
    prevCenterBrightnessRef.current = centerBrightness;
  }, [videoRef, isActive, checks.blink, checks.headMovement, detectFaces]);

  const resetLiveness = useCallback(() => {
    setChecks(Object.fromEntries(LIVENESS_CHECKS.map((c) => [c.id, false])));
    setActiveCheck('blink');
    prevBrightnessRef.current = null;
    prevCenterBrightnessRef.current = null;
    motionSamplesRef.current = [];
    setFaceError(null);
    setFaceCount(0);
  }, []);

  const confirmBlink = useCallback(() => {
    setChecks((prev) => ({ ...prev, blink: true }));
    setActiveCheck('headMovement');
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;

    const interval = setInterval(analyzeFrame, SAMPLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isActive, analyzeFrame]);

  return {
    checks,
    activeCheck,
    allComplete,
    faceCount,
    faceError,
    singleFaceConfirmed:
      !faceError || !faceError.includes('Multiple faces'),
    resetLiveness,
    confirmBlink,
  };
}
