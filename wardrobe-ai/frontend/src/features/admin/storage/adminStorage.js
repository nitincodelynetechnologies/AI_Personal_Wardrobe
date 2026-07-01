import { DEFAULT_MOCK_ORDERS } from '@/features/admin/storage/adminCrmStorage';
import {
  ORDERS_KEY,
  ORDERS_UPDATED,
  readOrders,
  updateOrderStatus as syncUpdateOrderStatus,
  writeOrders,
} from '@/features/shared/storage/platformSyncStorage';

export const ADMIN_SESSION_KEY = 'vton_admin_session';
/** @deprecated use ORDERS_KEY from platformSyncStorage */
export const MOCK_ORDERS_KEY = ORDERS_KEY;
export const COUPONS_KEY = 'vton_coupons';
export const ADMIN_ORDERS_UPDATED = ORDERS_UPDATED;
export const ADMIN_COUPONS_UPDATED = 'admin-coupons-updated';
export { DEFAULT_MOCK_ORDERS, ORDER_PIPELINE } from '@/features/admin/storage/adminCrmStorage';
export const DEFAULT_COUPONS = [
  { id: 1, code: 'AI30OFF', discount: 30, type: 'percent', status: 'active', uses: 142 },
  { id: 2, code: 'WELCOME10', discount: 10, type: 'percent', status: 'inactive', uses: 89 },
  { id: 3, code: 'VTON500', discount: 500, type: 'flat', status: 'inactive', uses: 12 },
];

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

function parseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function isAdminPortalAuthenticated() {
  return safeRead(ADMIN_SESSION_KEY) === 'true';
}

export function loginAdminPortal(username, password) {
  if (username === 'admin' && password === 'password') {
    safeWrite(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutAdminPortal() {
  safeWrite(ADMIN_SESSION_KEY, '');
}

export function readMockOrders() {
  return readOrders();
}

export function writeMockOrders(orders) {
  return writeOrders(orders);
}

export function updateOrderStatus(orderId, status) {
  return syncUpdateOrderStatus(orderId, status);
}
function normalizeCoupon(coupon) {
  if (!coupon || typeof coupon !== 'object') return null;

  const legacyEnabled = coupon.enabled;
  const status =
    coupon.status ??
    (legacyEnabled === false ? 'inactive' : legacyEnabled === true ? 'active' : 'inactive');

  return {
    ...coupon,
    status: status === 'active' ? 'active' : 'inactive',
  };
}

function ensureSingleActiveCoupon(coupons) {
  let activeAssigned = false;

  return coupons.map((coupon) => {
    if (coupon.status !== 'active') {
      return { ...coupon, status: 'inactive' };
    }

    if (activeAssigned) {
      return { ...coupon, status: 'inactive' };
    }

    activeAssigned = true;
    return { ...coupon, status: 'active' };
  });
}

export function formatCouponDiscount(coupon) {
  if (!coupon) return '';
  if (coupon.type === 'flat') return `₹${Number(coupon.discount).toLocaleString('en-IN')}`;
  return `${coupon.discount}%`;
}

export function readCoupons() {
  const stored = parseJson(safeRead(COUPONS_KEY), null);
  if (stored?.length) {
    return ensureSingleActiveCoupon(stored.map(normalizeCoupon).filter(Boolean));
  }

  const defaults = ensureSingleActiveCoupon(DEFAULT_COUPONS.map(normalizeCoupon).filter(Boolean));
  safeWrite(COUPONS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function getActiveCoupon() {
  return readCoupons().find((coupon) => coupon.status === 'active') ?? null;
}

export function toggleCouponStatus(couponId) {
  const coupons = readCoupons();
  const target = coupons.find((coupon) => coupon.id === couponId);
  if (!target) return coupons;

  const willActivate = target.status !== 'active';
  const next = coupons.map((coupon) => {
    if (coupon.id === couponId) {
      return { ...coupon, status: willActivate ? 'active' : 'inactive' };
    }
    return willActivate ? { ...coupon, status: 'inactive' } : coupon;
  });

  writeCoupons(next);
  return next;
}

export function writeCoupons(coupons) {
  const ok = safeWrite(COUPONS_KEY, JSON.stringify(coupons));
  if (ok && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_COUPONS_UPDATED));
  }
  return ok;
}
