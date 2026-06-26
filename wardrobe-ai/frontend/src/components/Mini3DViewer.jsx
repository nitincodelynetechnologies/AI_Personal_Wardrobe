'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { cn } from '@/lib/utils';
import { GARMENT_GLB_URLS } from '@/features/catalog/constants/garmentModels';

const SCENE_BACKGROUND = '#150d22';

function fitGarmentScene(scene) {
  const model = scene.clone(true);
  model.updateMatrixWorld(true);

  const box = new Box3().setFromObject(model);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const targetHeight = 2.2;
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  box.setFromObject(model);
  box.getCenter(center);
  model.position.sub(center);

  return model;
}

function GarmentModel({ url }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    return () => useGLTF.clear(url);
  }, [url]);

  const model = useMemo(() => fitGarmentScene(scene), [scene]);

  return (
    <Center>
      <primitive object={model} />
    </Center>
  );
}

function Mini3DScene({ glbUrl, isActive }) {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 2]} intensity={1.5} />
      <Suspense fallback={null}>
        <GarmentModel url={glbUrl} />
      </Suspense>
      <OrbitControls
        autoRotate={isActive}
        autoRotateSpeed={2}
        enableZoom={false}
        enablePan={false}
      />
    </>
  );
}

export function Mini3DViewer({ glbUrl, className }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!glbUrl) return undefined;
    useGLTF.preload(glbUrl);
  }, [glbUrl]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '80px', threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full w-full cursor-grab overflow-hidden rounded-t-xl bg-[#150d22] active:cursor-grabbing',
        className,
      )}
    >
      {isVisible && glbUrl ? (
        <Canvas
          key={glbUrl}
          dpr={[1, 1.25]}
          camera={{ position: [0, 0.15, 4], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.setClearColor(SCENE_BACKGROUND);
          }}
        >
          <color attach="background" args={[SCENE_BACKGROUND]} />
          <Mini3DScene glbUrl={glbUrl} isActive={isVisible} />
        </Canvas>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-[#150d22]"
          aria-hidden
        >
          <div className="h-8 w-8 animate-pulse rounded-full border border-magenta/30" />
        </div>
      )}
    </div>
  );
}

GARMENT_GLB_URLS.forEach((url) => useGLTF.preload(url));

export default Mini3DViewer;
