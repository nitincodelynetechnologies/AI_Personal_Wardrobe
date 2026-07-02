const SEEN_STATUSES_KEY = 'wardrobe-seen-order-statuses';

function readSeenMap() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = sessionStorage.getItem(SEEN_STATUSES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSeenMap(map) {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(SEEN_STATUSES_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors.
  }
}

function getUserSeenStatuses(userId) {
  if (!userId) return {};
  return readSeenMap()[userId] ?? {};
}

export function applyOrderReadState(userId, order) {
  if (!userId || !order) return order;

  const seenStatus = getUserSeenStatuses(userId)[order.id];
  const userUnreadUpdate = seenStatus != null && seenStatus !== order.status;

  return {
    ...order,
    userUnreadUpdate,
  };
}

export function markOrdersSeenForUser(userId, orders) {
  if (!userId || !Array.isArray(orders)) return;

  const map = readSeenMap();
  const seenForUser = { ...(map[userId] ?? {}) };

  orders.forEach((order) => {
    if (order?.id) {
      seenForUser[order.id] = order.status;
    }
  });

  map[userId] = seenForUser;
  writeSeenMap(map);
}

export function clearOrderReadStateForUser(userId) {
  if (!userId) return;

  const map = readSeenMap();
  delete map[userId];
  writeSeenMap(map);
}

export function clearAllOrderReadState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SEEN_STATUSES_KEY);
}

export function getUnreadOrdersForUser(userId, orders) {
  if (!userId || !Array.isArray(orders)) return [];

  return orders
    .map((order) => applyOrderReadState(userId, order))
    .filter((order) => order.userUnreadUpdate);
}
