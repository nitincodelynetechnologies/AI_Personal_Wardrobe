import { readSavedLooks, writeSavedLooks } from '@/features/face-studio/utils/bodyScanStorage';

export const VTON_PERSONAL_CLOSET_KEY = 'vton_personal_closet';
export const PERSONAL_CLOSET_UPDATED_EVENT = 'personal-closet-updated';

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

function parseCloset(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dispatchUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PERSONAL_CLOSET_UPDATED_EVENT));
}

export function normalizePersonalClosetItem(item) {
  if (!item || typeof item !== 'object') return null;

  const image =
    item.image ??
    item.previewImage ??
    item.top?.image_url ??
    item.pieces?.top?.image_url ??
    item.finalImage ??
    item.resultImage ??
    null;

  if (!image && !item.pieces) return null;

  const id = item.id ?? item.outfitId ?? `closet-${Date.now()}`;
  const savedAt = item.savedAt ?? item.date ?? item.timestamp ?? new Date().toISOString();

  return {
    id: String(id),
    outfitId: item.outfitId ?? null,
    image,
    name: item.name ?? item.garmentName ?? item.outfitName ?? 'Saved Look',
    category: item.category ?? item.seasonTag ?? item.season_tag ?? 'Outfit',
    styleScore: item.styleScore ?? item.style_score ?? null,
    source: item.source ?? 'style-studio',
    pieces: item.pieces ?? null,
    garmentName: item.garmentName ?? null,
    savedAt,
  };
}

function normalizeCloset(items) {
  return items.map(normalizePersonalClosetItem).filter(Boolean);
}

function readPrimaryCloset() {
  return normalizeCloset(parseCloset(safeRead(VTON_PERSONAL_CLOSET_KEY)));
}

/** Reads `vton_personal_closet`, falling back to legacy saved looks for display only. */
export function readPersonalCloset() {
  const primary = readPrimaryCloset();
  if (primary.length > 0) return primary;

  return normalizeCloset(
    readSavedLooks().map((look) => ({
      ...look,
      id: look.id ?? `legacy-${look.date ?? Date.now()}`,
      savedAt: look.date,
      source: 'virtual-try-on',
    })),
  );
}

export function writePersonalCloset(items) {
  const normalized = normalizeCloset(items);
  const ok = safeWrite(VTON_PERSONAL_CLOSET_KEY, JSON.stringify(normalized));
  if (ok) dispatchUpdated();
  return ok;
}

export function isInPersonalCloset(match) {
  const closet = readPrimaryCloset();
  const outfitId = match?.outfitId ?? match?.id;
  const image = match?.image;

  return closet.some(
    (item) =>
      (outfitId && item.outfitId === String(outfitId)) ||
      (image && item.image === image),
  );
}

export function addToPersonalCloset(entry) {
  const normalized = normalizePersonalClosetItem({
    ...entry,
    id: entry.id ?? `closet-${Date.now()}`,
    savedAt: entry.savedAt ?? new Date().toISOString(),
  });

  if (!normalized) return false;

  const existing = readPrimaryCloset();
  if (
    existing.some(
      (item) =>
        item.id === normalized.id ||
        (normalized.outfitId && item.outfitId === normalized.outfitId) ||
        (normalized.image && item.image === normalized.image),
    )
  ) {
    return false;
  }

  return writePersonalCloset([normalized, ...existing]);
}

export function removeFromPersonalCloset(itemId) {
  const id = String(itemId);
  const existing = readPrimaryCloset();
  const next = existing.filter((item) => item.id !== id);

  if (next.length !== existing.length) {
    return writePersonalCloset(next);
  }

  const legacy = readSavedLooks();
  const legacyNext = legacy.filter(
    (look) => String(look.id) !== id && `legacy-${look.date ?? look.id}` !== id,
  );

  if (legacyNext.length === legacy.length) {
    return false;
  }

  writeSavedLooks(legacyNext);
  dispatchUpdated();
  return true;
}

export function outfitToClosetEntry(outfit) {
  const image =
    outfit?.top?.image_url ??
    outfit?.bottom?.image_url ??
    outfit?.footwear?.image_url ??
    outfit?.accessory?.image_url ??
    null;

  return {
    id: `studio-${outfit.id}`,
    outfitId: String(outfit.id),
    image,
    name: outfit.name || 'AI Styled Look',
    category: outfit.season_tag || 'Outfit',
    styleScore: outfit.style_score ?? null,
    source: 'style-studio',
    pieces: {
      top: outfit.top ?? null,
      bottom: outfit.bottom ?? null,
      footwear: outfit.footwear ?? null,
      accessory: outfit.accessory ?? null,
    },
    savedAt: new Date().toISOString(),
  };
}
