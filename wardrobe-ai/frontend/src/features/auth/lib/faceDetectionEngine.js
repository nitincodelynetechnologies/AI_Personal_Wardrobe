'use client';

let modelsLoadingPromise = null;
let modelsLoaded = false;

export function areFaceModelsLoaded() {
  return modelsLoaded;
}

export async function loadFaceDetectionModels() {
  if (modelsLoaded) {
    return;
  }

  if (modelsLoadingPromise) {
    return modelsLoadingPromise;
  }

  modelsLoadingPromise = (async () => {
    const tf = await import('@tensorflow/tfjs-core');
    await import('@tensorflow/tfjs-backend-webgl');
    await tf.setBackend('webgl');
    await tf.ready();

    const faceapi = await import('@vladmandic/face-api');
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    modelsLoaded = true;
  })();

  return modelsLoadingPromise;
}

/** Ellipse match for the on-screen oval guide (video is mirrored in the UI). */
export function isFaceInOval(detection, videoWidth, videoHeight) {
  const box = detection.box;
  const centerX = videoWidth - (box.x + box.width / 2);
  const centerY = box.y + box.height / 2;
  const ovalCx = videoWidth * 0.5;
  const ovalCy = videoHeight * 0.5;
  const ovalRx = videoWidth * 0.225;
  const ovalRy = videoHeight * 0.275;
  const dx = (centerX - ovalCx) / ovalRx;
  const dy = (centerY - ovalCy) / ovalRy;
  return dx * dx + dy * dy <= 1;
}

export function isFaceLargeEnough(detection, videoWidth) {
  return detection.box.width >= videoWidth * 0.15;
}

export async function detectFacesInVideo(video, minScore) {
  if (!video?.videoWidth || video.readyState < 2) {
    return [];
  }

  const faceapi = await import('@vladmandic/face-api');
  const detections = await faceapi.detectAllFaces(
    video,
    new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: minScore,
    }),
  );

  return detections.filter((detection) => detection.score >= minScore);
}
