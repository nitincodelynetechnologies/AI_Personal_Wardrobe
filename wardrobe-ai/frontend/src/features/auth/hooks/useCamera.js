'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
};

const CAMERA_FALLBACK = {
  video: true,
  audio: false,
};

async function requestCameraStream() {
  try {
    return await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
  } catch {
    return navigator.mediaDevices.getUserMedia(CAMERA_FALLBACK);
  }
}

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [permission, setPermission] = useState('prompt');
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const attachStream = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return false;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    try {
      await video.play();

      if (video.readyState >= 2 && video.videoWidth > 0) {
        setIsReady(true);
        return true;
      }

      await new Promise((resolve) => {
        const onLoaded = () => {
          video.removeEventListener('loadeddata', onLoaded);
          resolve();
        };
        video.addEventListener('loadeddata', onLoaded);
      });

      setIsReady(true);
      return true;
    } catch (err) {
      setError(err.message || 'Unable to start camera preview.');
      setIsReady(false);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission('unsupported');
      setError('Camera is not supported on this device or browser.');
      return false;
    }

    try {
      stopCamera();
      const stream = await requestCameraStream();
      streamRef.current = stream;
      setPermission('granted');
      await attachStream();
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermission('denied');
        setError(
          'Camera access was denied. Please enable camera permissions in your browser settings.',
        );
      } else if (err.name === 'NotFoundError') {
        setPermission('unavailable');
        setError('No camera was found on this device.');
      } else {
        setPermission('error');
        setError(err.message || 'Unable to access the camera.');
      }
      return false;
    }
  }, [stopCamera, attachStream]);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isReady || video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          resolve(blob.type ? blob : new Blob([blob], { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.92,
      );
    });
  }, [isReady]);

  useEffect(() => {
    if (permission === 'granted' && streamRef.current) {
      attachStream();
    }
  }, [permission, attachStream]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    permission,
    error,
    isReady,
    startCamera,
    stopCamera,
    captureFrame,
  };
}
