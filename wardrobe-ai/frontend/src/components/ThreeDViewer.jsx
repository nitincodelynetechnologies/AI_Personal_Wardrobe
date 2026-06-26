'use client';

import { Component, Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Clone, Html, OrbitControls, useGLTF } from '@react-three/drei';
import {
  Box3,
  Color,
  CanvasTexture,
  DoubleSide,
  Euler,
  FrontSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { cn } from '@/lib/utils';
import { extractGarmentAssets } from '@/features/try-on/utils/garmentTexture';
import {
  pickGarmentTextureUrl,
  TEXTURE_PLACEHOLDER_PIXEL,
  useCrossOriginTexture,
} from '@/features/try-on/utils/textureUrl';
import {
  DEFAULT_GARMENT_GLB_URL,
  GARMENT_GLB_URLS,
  getGarmentFit,
} from '@/features/catalog/constants/garmentModels';
import { useFaceStudioStore } from '@/features/face-studio/store/useFaceStudioStore';

/** Virtual try-on avatar — frontend/public/dummy.glb */
export const DUMMY_GLB_URL = '/dummy.glb';

/** @deprecated Use selectedGlbUrl prop — kept for preload fallback */
export const SHIRT_GLB_URL = DEFAULT_GARMENT_GLB_URL;

const DEFAULT_FACE_TEXTURE_URL = '/auth/cand1.jpg';

/** Muted studio backdrop — contrasts with dark hair/head meshes */
const SCENE_BACKGROUND = '#2a2540';

const HEAD_NAME_PATTERN = /head|face|skull|visor/i;
const HAIR_NAME_PATTERN = /hair|scalp/i;

const FALLBACK_GARMENT_PIXEL = TEXTURE_PLACEHOLDER_PIXEL;

function isStockFaceUrl(url) {
  if (!url) return true;
  if (url === DEFAULT_FACE_TEXTURE_URL) return true;
  return url.includes('unsplash.com');
}

function isCapturedFaceUrl(url) {
  return Boolean(url) && !isStockFaceUrl(url);
}

let faceAlphaMask = null;

function getFaceAlphaMask() {
  if (faceAlphaMask || typeof document === 'undefined') return faceAlphaMask;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 280, 48, 256, 256, 236);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.58, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.4)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  faceAlphaMask = new CanvasTexture(canvas);
  faceAlphaMask.colorSpace = SRGBColorSpace;
  faceAlphaMask.needsUpdate = true;
  return faceAlphaMask;
}

function findHeadMesh(mannequin) {
  const classified = classifyMeshes(mannequin);
  const headCandidates = classified
    .filter((entry) => entry.role === 'head' || entry.normY > 0.68)
    .sort((a, b) => b.normY - a.normY);

  return headCandidates[0]?.mesh ?? null;
}

function getHeadProjectionPlacement(mannequin) {
  const bodyBox = new Box3().setFromObject(mannequin);
  const bodySize = new Vector3();
  bodyBox.getSize(bodySize);

  const classified = classifyMeshes(mannequin);
  const headEntry = classified
    .filter((entry) => entry.role === 'head' || entry.normY > 0.68)
    .sort((a, b) => b.normY - a.normY)[0];

  if (headEntry) {
    const headSize = new Vector3();
    const headCenter = new Vector3();
    headEntry.meshBox.getSize(headSize);
    headEntry.meshBox.getCenter(headCenter);

    return {
      position: new Vector3(
        headCenter.x,
        headCenter.y - headSize.y * 0.03,
        headCenter.z + headSize.z * 0.48,
      ),
      scale: new Vector3(headSize.x * 0.74, headSize.y * 0.9, 1),
    };
  }

  return {
    position: new Vector3(0, bodyBox.max.y - bodySize.y * 0.08, bodySize.z * 0.13),
    scale: new Vector3(bodySize.x * 0.3, bodySize.y * 0.21, 1),
  };
}

function createFaceProjectionDecal(headMesh, faceTexture) {
  if (!headMesh || !faceTexture) return null;

  headMesh.updateWorldMatrix(true, true);

  const headBox = new Box3().setFromObject(headMesh);
  const headCenter = new Vector3();
  const headSize = new Vector3();
  headBox.getCenter(headCenter);
  headBox.getSize(headSize);

  const position = headCenter.clone();
  position.z += headSize.z * 0.44;

  const orientation = new Euler(0, 0, 0);
  const decalSize = new Vector3(
    headSize.x * 0.82,
    headSize.y * 0.9,
    headSize.z * 0.5,
  );

  const geometry = new DecalGeometry(headMesh, position, orientation, decalSize);
  const material = new MeshStandardMaterial({
    map: faceTexture,
    alphaMap: getFaceAlphaMask(),
    transparent: true,
    opacity: 0.94,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    roughness: 0.42,
    metalness: 0,
  });

  return { geometry, material };
}

function UserFaceOverlay({ faceUrl, mannequin }) {
  const faceTexture = useCrossOriginTexture(faceUrl);
  const headMesh = useMemo(() => findHeadMesh(mannequin), [mannequin]);
  const placement = useMemo(() => getHeadProjectionPlacement(mannequin), [mannequin]);
  const faceDecal = useMemo(
    () => (headMesh ? createFaceProjectionDecal(headMesh, faceTexture) : null),
    [headMesh, faceTexture],
  );
  const alphaMask = useMemo(() => getFaceAlphaMask(), []);

  useEffect(() => {
    faceTexture.colorSpace = SRGBColorSpace;
    faceTexture.flipY = false;
    faceTexture.needsUpdate = true;
  }, [faceTexture]);

  return (
    <group name="user-face-overlay">
      {faceDecal ? (
        <mesh geometry={faceDecal.geometry} material={faceDecal.material} renderOrder={18} />
      ) : (
        <mesh position={placement.position} scale={placement.scale} renderOrder={19}>
          <planeGeometry args={[1, 1.12]} />
          <meshBasicMaterial
            map={faceTexture}
            alphaMap={alphaMask}
            transparent
            opacity={0.92}
            depthTest
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function resolveMeshRole(mesh, { normY, normX, volume, height }) {
  const name = (mesh.name || '').toLowerCase();

  if (HAIR_NAME_PATTERN.test(name)) return 'hair';
  if (HEAD_NAME_PATTERN.test(name)) return 'head';
  if (normY < 0.06 || volume < height * height * height * 0.002) return 'base';
  if (normY > 0.72) return 'head';
  if (normY >= 0.42 && normY <= 0.82) return normX > 0.62 ? 'arm' : 'torso';
  if (normY < 0.42) return 'leg';
  return 'other';
}

function classifyMeshes(model) {
  const modelBox = new Box3().setFromObject(model);
  const modelSize = new Vector3();
  const modelCenter = new Vector3();
  modelBox.getSize(modelSize);
  modelBox.getCenter(modelCenter);

  const height = modelSize.y || 1;
  const halfWidth = (modelSize.x || 1) / 2;
  const entries = [];

  model.traverse((child) => {
    if (!child.isMesh) return;

    const meshBox = new Box3().setFromObject(child);
    const center = new Vector3();
    const size = new Vector3();
    meshBox.getCenter(center);
    meshBox.getSize(size);

    const normY = (center.y - modelBox.min.y) / height;
    const normX = halfWidth > 0 ? Math.abs(center.x - modelCenter.x) / halfWidth : 0;
    const volume = size.x * size.y * size.z;

    const role = resolveMeshRole(child, { normY, normX, volume, height });

    entries.push({ mesh: child, role, center, meshBox, volume, normY });
  });

  return entries;
}

function findTorsoMesh(classified) {
  const torsoMeshes = classified.filter((entry) => entry.role === 'torso');
  if (!torsoMeshes.length) {
    return classified
      .filter((entry) => entry.role !== 'base' && entry.role !== 'head')
      .sort((a, b) => b.volume - a.volume)[0]?.mesh;
  }

  return torsoMeshes.sort((a, b) => b.volume - a.volume)[0].mesh;
}

function setMaterial(mesh, updater) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  materials.forEach((material) => {
    if (!material) return;
    updater(material);
    material.needsUpdate = true;
  });
}

function applyFaceTexture(mesh, faceTexture) {
  setMaterial(mesh, (material) => {
    material.map = faceTexture;
    material.color = new Color(0xffffff);
    material.emissive = new Color(0x333333);
    material.emissiveIntensity = 0.2;
    material.roughness = 0.45;
    material.metalness = 0;
  });
}

function applyHairMaterial(mesh) {
  setMaterial(mesh, (material) => {
    material.map = null;
    material.color = new Color('#3d2e24');
    material.roughness = 0.85;
    material.metalness = 0;
  });
}

function applyShirtMaterial(mesh, shirtColor) {
  setMaterial(mesh, (material) => {
    material.map = null;
    material.color = new Color(shirtColor);
    material.roughness = 0.68;
    material.metalness = 0.02;
  });
}

function applySkinMaterial(mesh, skinColor) {
  setMaterial(mesh, (material) => {
    material.map = null;
    material.color = new Color(skinColor);
    material.roughness = 0.58;
    material.metalness = 0.01;
  });
}

function applyPantMaterial(mesh, pantColor) {
  setMaterial(mesh, (material) => {
    material.map = null;
    material.color = new Color(pantColor);
    material.roughness = 0.75;
    material.metalness = 0.03;
  });
}

function applyBaseMaterial(mesh) {
  setMaterial(mesh, (material) => {
    material.map = null;
    material.color = new Color('#141018');
    material.roughness = 0.9;
    material.metalness = 0;
  });
}

function applyGarmentToModel(model, {
  faceTexture,
  shirtColor,
  pantColor,
  skinColor,
  showJacketLayer,
  useFaceOverlay,
}) {
  const classified = classifyMeshes(model);

  const headCandidates = classified
    .filter((entry) => entry.role === 'head' || entry.normY > 0.68)
    .sort((a, b) => b.normY - a.normY);

  if (headCandidates.length) {
    if (useFaceOverlay) {
      applySkinMaterial(headCandidates[0].mesh, skinColor);
    } else {
      applyFaceTexture(headCandidates[0].mesh, faceTexture);
    }
    headCandidates.slice(1).forEach(({ mesh, role }) => {
      if (role === 'hair') applyHairMaterial(mesh);
    });
  }

  classified.forEach(({ mesh, role, normY }) => {
    if (role === 'head' || normY > 0.68) return;
    if (role === 'hair') applyHairMaterial(mesh);
    else if (role === 'torso') {
      // Keep the body visible under the jacket layer — skin, not hidden base material.
      if (showJacketLayer) applySkinMaterial(mesh, skinColor);
      else applyShirtMaterial(mesh, shirtColor);
    } else if (role === 'arm') {
      mesh.visible = !showJacketLayer;
      if (!showJacketLayer) applySkinMaterial(mesh, skinColor);
    }
    else if (role === 'leg') applyPantMaterial(mesh, pantColor);
    else if (role === 'base' && normY < 0.5) applyPantMaterial(mesh, pantColor);
    else if (role === 'base') applyBaseMaterial(mesh);
    else if (normY < 0.48) applyPantMaterial(mesh, pantColor);
    else applySkinMaterial(mesh, skinColor);
  });

  return findTorsoMesh(classified);
}

function createShirtDecal(torsoMesh, shirtTexture) {
  if (!torsoMesh || !shirtTexture) return null;

  torsoMesh.updateWorldMatrix(true, true);

  const torsoBox = new Box3().setFromObject(torsoMesh);
  const torsoCenter = new Vector3();
  const torsoSize = new Vector3();
  torsoBox.getCenter(torsoCenter);
  torsoBox.getSize(torsoSize);

  const position = torsoCenter.clone();
  position.y += torsoSize.y * 0.12;
  position.z += torsoSize.z * 0.42;

  const orientation = new Euler(0, 0, 0);
  const decalSize = new Vector3(
    torsoSize.x * 0.95,
    torsoSize.y * 0.72,
    torsoSize.z * 0.65,
  );

  const geometry = new DecalGeometry(torsoMesh, position, orientation, decalSize);
  const material = new MeshStandardMaterial({
    map: shirtTexture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    roughness: 0.72,
    metalness: 0.02,
  });

  return { geometry, material };
}

function prepareModel(scene) {
  const model = scene.clone(true);
  model.updateMatrixWorld(true);

  const box = new Box3().setFromObject(model);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const targetHeight = 2.4;
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  box.setFromObject(model);
  box.getCenter(center);
  model.position.sub(center);

  return model;
}

function enhanceJacketMeshes(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.renderOrder = 10;
    child.frustumCulled = false;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      material.side = FrontSide;
      material.depthWrite = true;
      material.depthTest = true;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -2;
      if (material.map) {
        material.map.colorSpace = SRGBColorSpace;
        material.map.needsUpdate = true;
      }
      if (material.metalnessRoughnessMap) {
        material.metalnessRoughnessMap.colorSpace = SRGBColorSpace;
      }
      if (material.normalMap) {
        material.normalMap.colorSpace = SRGBColorSpace;
      }
      material.needsUpdate = true;
    });
  });
}

function isGarmentSleeveSpanMesh(mesh) {
  const meshBox = new Box3().setFromObject(mesh);
  const size = new Vector3();
  meshBox.getSize(size);
  if (size.y <= 0.01) return false;
  return size.x / size.y > 1.42 && size.x > 2.8;
}

function prepareGarmentMeshes(root, glbUrl) {
  const fit = getGarmentFit(glbUrl);

  root.traverse((child) => {
    if (!child.isMesh) return;
    if (fit.hideSleeveSpan && isGarmentSleeveSpanMesh(child)) {
      child.visible = false;
    }
  });
}

function getVisibleGarmentBounds(root) {
  const box = new Box3();
  let hasMesh = false;

  root.traverse((child) => {
    if (!child.isMesh || child.visible === false) return;

    const meshBox = new Box3().setFromObject(child);
    const size = new Vector3();
    meshBox.getSize(size);

    if (size.y > 0 && size.z > size.y * 10) return;
    if (size.y > 0 && size.x > size.y * 25) return;

    if (!hasMesh) {
      box.copy(meshBox);
      hasMesh = true;
    } else {
      box.union(meshBox);
    }
  });

  return hasMesh ? box : new Box3().setFromObject(root);
}

function getMannequinTorsoMetrics(mannequinModel) {
  const classified = classifyMeshes(mannequinModel);
  const torsoMesh = findTorsoMesh(classified);
  const bodyBox = new Box3().setFromObject(mannequinModel);
  const bodySize = new Vector3();
  const bodyCenter = new Vector3();
  bodyBox.getSize(bodySize);
  bodyBox.getCenter(bodyCenter);

  if (torsoMesh) {
    torsoMesh.updateWorldMatrix(true, true);
    const torsoBox = new Box3().setFromObject(torsoMesh);
    const torsoSize = new Vector3();
    const torsoCenter = new Vector3();
    torsoBox.getSize(torsoSize);
    torsoBox.getCenter(torsoCenter);

    return {
      chestCenter: torsoCenter,
      torsoWidth: torsoSize.x,
      torsoHeight: torsoSize.y,
      shoulderY: bodyBox.min.y + bodySize.y * 0.885,
      bodySize,
    };
  }

  return {
    chestCenter: new Vector3(bodyCenter.x, bodyBox.min.y + bodySize.y * 0.7, bodyCenter.z),
    torsoWidth: bodySize.x * 0.36,
    torsoHeight: bodySize.y * 0.28,
    shoulderY: bodyBox.min.y + bodySize.y * 0.885,
    bodySize,
  };
}

function getWearAnchor(mannequinModel) {
  return getMannequinTorsoMetrics(mannequinModel);
}

function alignJacketToMannequin(jacketScene, mannequinModel, glbUrl) {
  const jacket = jacketScene.clone(true);
  enhanceJacketMeshes(jacket);
  prepareGarmentMeshes(jacket, glbUrl);

  const garmentBounds = getVisibleGarmentBounds(jacket);
  const garmentCenter = new Vector3();
  garmentBounds.getCenter(garmentCenter);
  jacket.position.sub(garmentCenter);
  jacket.updateMatrixWorld(true);

  const anchor = getWearAnchor(mannequinModel);
  const fit = getGarmentFit(glbUrl);

  const jacketBox = getVisibleGarmentBounds(jacket);
  const jacketSize = new Vector3();
  jacketBox.getSize(jacketSize);

  const effectiveTorsoWidth = jacketSize.x * (fit.torsoWidthFactor ?? 1);
  const targetWidth = anchor.torsoWidth * fit.widthRatio;
  const targetHeight = anchor.bodySize.y * fit.heightRatio;

  const scaleX = targetWidth / (effectiveTorsoWidth || 1);
  const scaleY = targetHeight / (jacketSize.y || 1);
  const uniformScale = Math.min(scaleX, scaleY) * fit.scale;

  jacket.scale.setScalar(uniformScale);

  jacket.updateMatrixWorld(true);
  jacketBox.setFromObject(jacket);
  const jacketCenter = new Vector3();
  jacketBox.getCenter(jacketCenter);

  jacket.position.x += anchor.chestCenter.x - jacketCenter.x + fit.offsetX;
  jacket.position.y += anchor.shoulderY - jacketBox.max.y + fit.offsetY;
  jacket.position.z += anchor.chestCenter.z - jacketCenter.z + fit.offsetZ;

  return jacket;
}

function DynamicGarmentInner({ glbUrl, mannequinModel }) {
  const { scene } = useGLTF(glbUrl);

  useEffect(() => {
    useGLTF.preload(glbUrl);
    return () => {
      useGLTF.clear(glbUrl);
    };
  }, [glbUrl]);

  const garment = useMemo(
    () => alignJacketToMannequin(scene, mannequinModel, glbUrl),
    [scene, mannequinModel, glbUrl],
  );

  if (!garment) return null;

  return <Clone object={garment} />;
}

function DynamicGarment({ glbUrl, mannequinModel }) {
  if (!glbUrl) return null;

  return (
    <Suspense fallback={null}>
      <DynamicGarmentInner glbUrl={glbUrl} mannequinModel={mannequinModel} />
    </Suspense>
  );
}

function ShirtDecal({ torsoMesh, shirtTexture }) {
  const decal = useMemo(
    () => createShirtDecal(torsoMesh, shirtTexture),
    [torsoMesh, shirtTexture],
  );

  if (!decal) return null;

  return <mesh geometry={decal.geometry} material={decal.material} renderOrder={5} />;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="rounded-full border border-magenta/30 bg-obsidian/90 px-4 py-2 text-xs font-mono uppercase tracking-widest text-magenta">
        Loading 3D assets…
      </div>
    </Html>
  );
}

function FallbackMannequin({
  userFaceUrl,
  shirtTextureUrl,
  shirtColor,
  pantColor,
  skinColor,
  useFaceOverlay,
}) {
  const faceTexture = useCrossOriginTexture(userFaceUrl || DEFAULT_FACE_TEXTURE_URL);
  const shirtTexture = useCrossOriginTexture(shirtTextureUrl || FALLBACK_GARMENT_PIXEL);

  useEffect(() => {
    faceTexture.colorSpace = SRGBColorSpace;
    faceTexture.flipY = false;
    faceTexture.needsUpdate = true;
    shirtTexture.colorSpace = SRGBColorSpace;
    shirtTexture.needsUpdate = true;
  }, [faceTexture, shirtTexture]);

  return (
    <Bounds fit clip observe margin={1.2}>
      <group position={[0, -0.15, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.48, 1.1, 32]} />
          <meshStandardMaterial color={shirtColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.35, 0.31]} renderOrder={5}>
          <planeGeometry args={[0.9, 1.05]} />
          <meshStandardMaterial
            map={shirtTexture}
            transparent
            depthWrite={false}
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.38, 1.2, 32]} />
          <meshStandardMaterial color={pantColor} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[0, Math.PI, 0]} castShadow>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshStandardMaterial
            map={useFaceOverlay ? null : faceTexture}
            color={useFaceOverlay ? skinColor : '#ffffff'}
            roughness={0.42}
          />
        </mesh>
        {useFaceOverlay && userFaceUrl && (
          <mesh position={[0, 1.15, 0.34]} scale={[0.5, 0.58, 1]} renderOrder={19}>
            <planeGeometry args={[1, 1.12]} />
            <meshBasicMaterial
              map={faceTexture}
              alphaMap={getFaceAlphaMask()}
              transparent
              opacity={0.92}
              depthTest
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
        <mesh position={[-0.72, 0.35, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.75, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.58} />
        </mesh>
        <mesh position={[0.72, 0.35, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.75, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.58} />
        </mesh>
      </group>
    </Bounds>
  );
}

function HumanMannequin({
  userFaceUrl,
  productImageUrl,
  shirtColor,
  pantColor,
  skinColor,
  shirtTextureUrl,
  selectedGlbUrl,
}) {
  const { scene: mannequinScene } = useGLTF(DUMMY_GLB_URL);
  const faceTexture = useCrossOriginTexture(userFaceUrl || DEFAULT_FACE_TEXTURE_URL);
  const shirtTexture = useCrossOriginTexture(shirtTextureUrl || FALLBACK_GARMENT_PIXEL);
  const wearGarmentGlb = Boolean(selectedGlbUrl);

  const mannequin = useMemo(() => prepareModel(mannequinScene), [mannequinScene]);

  const torsoMesh = useMemo(() => findTorsoMesh(classifyMeshes(mannequin)), [mannequin]);
  const useFaceOverlay = isCapturedFaceUrl(userFaceUrl);

  useEffect(() => {
    faceTexture.colorSpace = SRGBColorSpace;
    faceTexture.flipY = false;
    faceTexture.needsUpdate = true;
    shirtTexture.colorSpace = SRGBColorSpace;
    shirtTexture.needsUpdate = true;

    applyGarmentToModel(mannequin, {
      faceTexture,
      shirtColor,
      pantColor,
      skinColor,
      showJacketLayer: wearGarmentGlb,
      useFaceOverlay,
    });
  }, [
    mannequin,
    faceTexture,
    shirtTexture,
    shirtColor,
    pantColor,
    skinColor,
    wearGarmentGlb,
    useFaceOverlay,
  ]);

  return (
    <group position={[0, 0.15, 0]} scale={1.85}>
      {mannequinScene && <Clone object={mannequin} />}
      {useFaceOverlay && (
        <Suspense fallback={null}>
          <UserFaceOverlay faceUrl={userFaceUrl} mannequin={mannequin} />
        </Suspense>
      )}
      {wearGarmentGlb ? (
        <DynamicGarment
          key={selectedGlbUrl}
          glbUrl={selectedGlbUrl}
          mannequinModel={mannequin}
        />
      ) : (
        shirtTextureUrl && (
          <ShirtDecal torsoMesh={torsoMesh} shirtTexture={shirtTexture} />
        )
      )}
    </group>
  );
}

class MannequinErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[ThreeDViewer] dummy.glb load failed, using fallback mannequin.', error);
  }

  render() {
    if (this.state.failed) {
      return <FallbackMannequin {...this.props} />;
    }

    return this.props.children;
  }
}

function AvatarModel({
  userFaceUrl,
  productImageUrl,
  shirtColor,
  pantColor,
  skinColor,
  shirtTextureUrl,
  selectedGlbUrl,
}) {
  const [modelStatus, setModelStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    fetch(DUMMY_GLB_URL, { method: 'HEAD' })
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          useGLTF.preload(DUMMY_GLB_URL);
          GARMENT_GLB_URLS.forEach((url) => useGLTF.preload(url));
          setModelStatus('ready');
        } else {
          setModelStatus('missing');
        }
      })
      .catch(() => {
        if (!cancelled) setModelStatus('missing');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sharedProps = {
    userFaceUrl,
    shirtTextureUrl,
    shirtColor,
    pantColor,
    skinColor,
    useFaceOverlay: isCapturedFaceUrl(userFaceUrl),
  };

  if (modelStatus === 'checking') {
    return (
      <Html center>
        <div className="rounded-full border border-magenta/30 bg-obsidian/90 px-4 py-2 text-xs font-mono uppercase tracking-widest text-magenta">
          Loading mannequin…
        </div>
      </Html>
    );
  }

  if (modelStatus === 'missing') {
    return <FallbackMannequin {...sharedProps} />;
  }

  return (
    <MannequinErrorBoundary {...sharedProps}>
      <HumanMannequin
        userFaceUrl={userFaceUrl}
        productImageUrl={productImageUrl}
        shirtColor={shirtColor}
        pantColor={pantColor}
        skinColor={skinColor}
        shirtTextureUrl={shirtTextureUrl}
        selectedGlbUrl={selectedGlbUrl}
      />
    </MannequinErrorBoundary>
  );
}

function Scene({ userFaceUrl, productImageUrl, garmentAssets, selectedGlbUrl }) {
  const shirtColor = garmentAssets?.shirtColor ?? '#f4f4f5';
  const pantColor = garmentAssets?.pantColor ?? '#1e293b';
  const skinColor = garmentAssets?.skinColor ?? '#c9a27a';
  const shirtTextureUrl = pickGarmentTextureUrl(garmentAssets);

  return (
    <>
      <ambientLight intensity={1.5} />
      <hemisphereLight intensity={0.6} color="#f0e8ff" groundColor="#1a1528" />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow color="#ffffff" />
      <directionalLight position={[-3, 2, 3]} intensity={0.5} color="#7c3aed" />
      <directionalLight position={[2, 1, -2]} intensity={0.25} color="#e91e8c" />

      <Suspense fallback={<LoadingSpinner />}>
        <AvatarModel
          key={`${userFaceUrl || 'blank'}-${selectedGlbUrl || 'no-glb'}`}
          userFaceUrl={userFaceUrl}
          productImageUrl={productImageUrl}
          shirtColor={shirtColor}
          pantColor={pantColor}
          skinColor={skinColor}
          shirtTextureUrl={shirtTextureUrl}
          selectedGlbUrl={selectedGlbUrl}
        />
      </Suspense>

      <OrbitControls
        makeDefault
        target={[0, 0.35, 0]}
        enableZoom={false}
        enableRotate
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('[ThreeDViewer]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center bg-obsidian p-6 text-center">
            <p className="text-sm text-white/70">3D viewer failed to load. Close and reopen try-on.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function ThreeDViewer({
  userFaceUrl: userFaceUrlProp,
  productImageUrl,
  torsoColor: _torsoColor,
  className,
  selectedGlbUrl = null,
  hasSleeves: _hasSleeves,
}) {
  const storeFace = useFaceStudioStore((state) => state.userFace);
  const userFaceUrl = userFaceUrlProp ?? storeFace;
  const [mounted, setMounted] = useState(false);
  const [garmentAssets, setGarmentAssets] = useState(null);
  const wearGarmentGlb = Boolean(selectedGlbUrl);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedGlbUrl) {
      useGLTF.preload(selectedGlbUrl);
    }
    useGLTF.preload(DUMMY_GLB_URL);
  }, [selectedGlbUrl]);

  useEffect(() => {
    if (!productImageUrl || wearGarmentGlb) {
      setGarmentAssets(null);
      return undefined;
    }

    let cancelled = false;

    extractGarmentAssets(productImageUrl).then((assets) => {
      if (!cancelled) setGarmentAssets(assets);
    });

    return () => {
      cancelled = true;
    };
  }, [productImageUrl, wearGarmentGlb]);

  if (!mounted) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-obsidian', className)}>
        <p className="text-xs font-mono uppercase tracking-widest text-magenta">Loading 3D…</p>
      </div>
    );
  }

  return (
    <ViewerErrorBoundary>
      <div className={cn('relative h-full w-full min-h-[300px] overflow-hidden bg-obsidian/50 md:min-h-[500px]', className)}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          camera={{ position: [0, 0.6, 7.5], fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(SCENE_BACKGROUND);
          }}
        >
          <color attach="background" args={[SCENE_BACKGROUND]} />
          <Scene
            userFaceUrl={userFaceUrl}
            productImageUrl={productImageUrl}
            garmentAssets={garmentAssets}
            selectedGlbUrl={selectedGlbUrl}
          />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <span className="rounded-full border border-white/10 bg-obsidian/70 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-white/45 backdrop-blur-sm">
            Drag to rotate
          </span>
        </div>
      </div>
    </ViewerErrorBoundary>
  );
}

export default ThreeDViewer;

useGLTF.preload(DUMMY_GLB_URL);
GARMENT_GLB_URLS.forEach((url) => useGLTF.preload(url));
