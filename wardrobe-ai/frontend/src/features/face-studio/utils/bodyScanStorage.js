const BODY_SCAN_KEY = 'userBodyScan';
export const WARDROBE_SAVED_LOOKS_KEY = 'wardrobe_saved_looks';
const LEGACY_SAVED_LOOKS_KEY = 'savedLooks';
const LEGACY_CLOSET_LOOKS_KEY = 'personalClosetLooks';

export const SAVED_LOOKS_UPDATED_EVENT = 'saved-looks-updated';

function scopedKey(base, userId) {
  return userId ? `${base}:${userId}` : base;
}

function safeRead(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function parseLooks(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeLook(look) {
  if (!look || typeof look !== 'object') return null;

  const finalImage =
    look.finalImage ?? look.resultImage ?? (typeof look.baseImage === 'string' ? look.baseImage : null);

  if (!finalImage) return null;

  return {
    id: look.id ?? Date.now(),
    finalImage,
    garmentName: look.garmentName ?? look.garment?.name ?? 'Custom Fit',
    category: look.category ?? look.garment?.type ?? look.garment?.category ?? 'Outfit',
    date: look.date ?? new Date().toLocaleDateString(),
  };
}

function normalizeLooks(looks) {
  return looks.map(normalizeLook).filter(Boolean);
}

function migrateLegacyLooks(userId) {
  const sources = [
    safeRead(WARDROBE_SAVED_LOOKS_KEY),
    safeRead(scopedKey(WARDROBE_SAVED_LOOKS_KEY, userId)),
    safeRead(scopedKey(LEGACY_SAVED_LOOKS_KEY, userId)),
    safeRead(LEGACY_SAVED_LOOKS_KEY),
    safeRead(scopedKey(LEGACY_CLOSET_LOOKS_KEY, userId)),
    safeRead(LEGACY_CLOSET_LOOKS_KEY),
  ];

  const merged = [];
  const seen = new Set();

  for (const raw of sources) {
    for (const look of parseLooks(raw)) {
      const normalized = normalizeLook(look);
      if (!normalized || seen.has(normalized.finalImage)) continue;
      seen.add(normalized.finalImage);
      merged.push(normalized);
    }
  }

  if (merged.length > 0) {
    const payload = JSON.stringify(merged);
    safeWrite(WARDROBE_SAVED_LOOKS_KEY, payload);
    if (userId) {
      safeWrite(scopedKey(WARDROBE_SAVED_LOOKS_KEY, userId), payload);
    }
  }

  return merged;
}

/** Read persisted full-body scan (data URL). Falls back to legacy unscoped key. */
export function readBodyScan(userId) {
  const scoped = safeRead(scopedKey(BODY_SCAN_KEY, userId));
  if (scoped) return scoped;
  return safeRead(BODY_SCAN_KEY);
}

export function writeBodyScan(userId, dataUrl) {
  if (!dataUrl) return false;
  const saved = safeWrite(scopedKey(BODY_SCAN_KEY, userId), dataUrl);
  if (userId) {
    safeWrite(BODY_SCAN_KEY, dataUrl);
  }
  return saved;
}

/** Read VTON saved looks — key: `wardrobe_saved_looks`. */
export function readSavedLooks(userId) {
  const scopedLooks = normalizeLooks(parseLooks(safeRead(scopedKey(WARDROBE_SAVED_LOOKS_KEY, userId))));
  if (scopedLooks.length > 0) return scopedLooks;

  const globalLooks = normalizeLooks(parseLooks(safeRead(WARDROBE_SAVED_LOOKS_KEY)));
  if (globalLooks.length > 0) return globalLooks;

  return migrateLegacyLooks(userId);
}

export function writeSavedLooks(looks, userId) {
  const payload = JSON.stringify(looks);
  const globalOk = safeWrite(WARDROBE_SAVED_LOOKS_KEY, payload);
  const scopedOk = userId ? safeWrite(scopedKey(WARDROBE_SAVED_LOOKS_KEY, userId), payload) : true;

  if (typeof window !== 'undefined' && (globalOk || scopedOk)) {
    window.dispatchEvent(new CustomEvent(SAVED_LOOKS_UPDATED_EVENT));
  }

  return globalOk && scopedOk;
}

/** @deprecated Use writeSavedLooks with normalized look shape */
export function appendSavedLook(userId, look) {
  const normalized = normalizeLook({
    ...look,
    finalImage: look.finalImage ?? look.resultImage,
    garmentName: look.garmentName ?? look.garment?.name,
    category: look.category ?? look.garment?.type,
  });

  if (!normalized) return readSavedLooks(userId);

  const existing = readSavedLooks(userId);
  if (existing.some((item) => item.finalImage === normalized.finalImage)) {
    return existing;
  }

  const next = [...existing, normalized];
  writeSavedLooks(next, userId);
  return next;
}

/** @deprecated Use readSavedLooks */
export function readPersonalClosetLooks(userId) {
  return readSavedLooks(userId);
}

/** @deprecated Use writeSavedLooks */
export function appendPersonalClosetLook(userId, look) {
  return appendSavedLook(userId, look);
}
