const BODY_SCAN_KEY = 'userBodyScan';
export const USER_SAVED_LOOKS_KEY = 'user_saved_looks';
/** @deprecated use USER_SAVED_LOOKS_KEY */
export const VTON_SAVED_LOOKS_KEY = USER_SAVED_LOOKS_KEY;
/** @deprecated use USER_SAVED_LOOKS_KEY */
export const WARDROBE_SAVED_LOOKS_KEY = USER_SAVED_LOOKS_KEY;
const LEGACY_VTON_SAVED_LOOKS_KEY = 'vton_saved_looks';
const LEGACY_WARDROBE_SAVED_LOOKS_KEY = 'wardrobe_saved_looks';
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

  const image =
    look.image ??
    look.finalImage ??
    look.resultImage ??
    (typeof look.baseImage === 'string' ? look.baseImage : null);

  if (!image) return null;

  return {
    id: look.id ?? Date.now(),
    image,
    finalImage: image,
    garmentName: look.garmentName ?? look.garment?.name ?? 'Custom Fit',
    category: look.category ?? look.garment?.type ?? look.garment?.category ?? 'Outfit',
    date: look.date ?? new Date().toISOString(),
  };
}

function normalizeLooks(looks) {
  return looks.map(normalizeLook).filter(Boolean);
}

function collectLegacySources(userId) {
  const bases = [
    LEGACY_VTON_SAVED_LOOKS_KEY,
    LEGACY_WARDROBE_SAVED_LOOKS_KEY,
    LEGACY_SAVED_LOOKS_KEY,
    LEGACY_CLOSET_LOOKS_KEY,
  ];

  const keys = [USER_SAVED_LOOKS_KEY];

  for (const base of bases) {
    keys.push(base);
    if (userId) keys.push(scopedKey(base, userId));
  }

  return keys;
}

function migrateLegacyLooks(userId) {
  const merged = [];
  const seen = new Set();

  for (const key of collectLegacySources(userId)) {
    if (key === USER_SAVED_LOOKS_KEY) continue;

    for (const look of parseLooks(safeRead(key))) {
      const normalized = normalizeLook(look);
      if (!normalized || seen.has(normalized.image)) continue;
      seen.add(normalized.image);
      merged.push(normalized);
    }
  }

  if (merged.length > 0) {
    safeWrite(USER_SAVED_LOOKS_KEY, JSON.stringify(merged));
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

/** Read saved looks from `user_saved_looks` (single global key). */
export function readSavedLooks(_userId) {
  const current = normalizeLooks(parseLooks(safeRead(USER_SAVED_LOOKS_KEY)));
  if (current.length > 0) return current;

  return migrateLegacyLooks(_userId);
}

export function writeSavedLooks(looks, _userId) {
  const normalized = normalizeLooks(looks);
  const payload = JSON.stringify(normalized);
  const ok = safeWrite(USER_SAVED_LOOKS_KEY, payload);

  if (typeof window !== 'undefined' && ok) {
    window.dispatchEvent(new CustomEvent(SAVED_LOOKS_UPDATED_EVENT));
  }

  return ok;
}

/** @deprecated Use writeSavedLooks with normalized look shape */
export function appendSavedLook(userId, look) {
  const normalized = normalizeLook({
    ...look,
    image: look.image ?? look.finalImage ?? look.resultImage,
    garmentName: look.garmentName ?? look.garment?.name,
    category: look.category ?? look.garment?.type,
  });

  if (!normalized) return readSavedLooks(userId);

  const existing = readSavedLooks(userId);
  if (existing.some((item) => item.image === normalized.image)) {
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
