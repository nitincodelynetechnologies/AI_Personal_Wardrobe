import {
  ORDERS_KEY,
  ORDERS_UPDATED,
  LEGACY_ORDERS_KEY,
} from '@/features/shared/storage/platformSyncStorage';
import {
  readSavedLooks,
  SAVED_LOOKS_UPDATED_EVENT,
} from '@/features/face-studio/utils/bodyScanStorage';

const WISHLIST_KEYS = ['vton_wishlist', 'wardrobe-wishlist'];
const ORDER_KEYS = [ORDERS_KEY, LEGACY_ORDERS_KEY, 'wardrobe-orders'];

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function lengthOfArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function lengthFromZustandItems(parsed) {
  return lengthOfArray(parsed?.state?.items);
}

function lengthFromZustandOrders(parsed) {
  return lengthOfArray(parsed?.state?.orders);
}

function readMaxArrayLength(keys, resolver) {
  if (typeof window === 'undefined') return 0;

  let maxCount = 0;

  for (const key of keys) {
    const parsed = safeParse(localStorage.getItem(key));
    if (!parsed) continue;

    const count = resolver(parsed);
    if (count > maxCount) maxCount = count;
  }

  return maxCount;
}

export function getWishlistItemsCount() {
  return readMaxArrayLength(WISHLIST_KEYS, (parsed) => {
    if (Array.isArray(parsed)) return parsed.length;
    return lengthFromZustandItems(parsed);
  });
}

export function getSavedLooksCount() {
  if (typeof window === 'undefined') return 0;
  return readSavedLooks().length;
}

export function getOrdersPlacedCount() {
  return readMaxArrayLength(ORDER_KEYS, (parsed) => {
    if (Array.isArray(parsed)) return parsed.length;
    return lengthFromZustandOrders(parsed);
  });
}

/** No wardrobe array is persisted in localStorage yet — returns 0 until tracked. */
export function getWardrobeItemsCount() {
  return 0;
}

export function readDashboardProfileStats() {
  return {
    outfitsSaved: getWishlistItemsCount(),
    tryOnsDone: getSavedLooksCount(),
    wardrobeItems: getWardrobeItemsCount(),
    ordersPlaced: getOrdersPlacedCount(),
  };
}

export const PROFILE_STATS_REFRESH_EVENTS = [
  SAVED_LOOKS_UPDATED_EVENT,
  ORDERS_UPDATED,
  'storage',
];
