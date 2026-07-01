const INVALID_ORDER_STATUSES = new Set(['cancelled', 'canceled', 'refunded']);
const AT_RISK_DAYS = 30;
const MOCK_ABANDONED_ITEMS = [
  'Premium 3D Linen Shirt',
  '3D Urban Bomber Jacket',
  'Slim Fit Denim',
  'Chelsea Leather Boot',
];

function isValidOrder(order) {
  const status = (order?.status ?? '').toLowerCase();
  return Boolean(status) && !INVALID_ORDER_STATUSES.has(status);
}

function getOrderAmount(order) {
  return Number(order?.amount ?? order?.total ?? 0) || 0;
}

function parseOrderDate(order) {
  const raw = order?.createdAt ?? order?.date ?? null;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractProductNames(order) {
  if (Array.isArray(order?.products) && order.products.length > 0) {
    return order.products.filter(Boolean);
  }

  if (Array.isArray(order?.lineItems) && order.lineItems.length > 0) {
    return order.lineItems.map((item) => item.name).filter(Boolean);
  }

  if (Array.isArray(order?.items) && order.items.length > 0 && typeof order.items[0] === 'object') {
    return order.items.map((item) => item.name).filter(Boolean);
  }

  return [];
}

function emailHash(email) {
  return (email ?? '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getMockAbandonedCart(email, orderCount) {
  if (orderCount < 2 || orderCount >= 5) return null;
  const index = emailHash(email) % MOCK_ABANDONED_ITEMS.length;
  if (emailHash(email) % 4 !== 0) return null;
  return MOCK_ABANDONED_ITEMS[index];
}

function daysSince(date) {
  if (!date) return Infinity;
  const now = Date.now();
  return Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function assignCustomerSegment({ orders, ltv, lastOrderDate, abandonedCart }) {
  if (orders >= 5 || ltv >= 30000) return 'VIP';
  if (orders === 1) return 'New';

  const inactive = daysSince(lastOrderDate) > AT_RISK_DAYS;
  if (inactive || abandonedCart) return 'At Risk';
  if (orders >= 2 && orders < 5) return 'Regular';

  return 'Regular';
}

export function aggregateCustomersFromOrders(orders = []) {
  const byEmail = new Map();

  orders.filter(isValidOrder).forEach((order) => {
    const email = (order.email ?? order.shipping?.email ?? '').trim().toLowerCase();
    if (!email) return;

    const existing = byEmail.get(email) ?? {
      id: email,
      name: order.customer ?? order.shipping?.fullName ?? 'Guest',
      email,
      orders: 0,
      ltv: 0,
      purchaseHistory: [],
      lastOrderDate: null,
    };

    existing.orders += 1;
    existing.ltv += getOrderAmount(order);

    const orderDate = parseOrderDate(order);
    if (orderDate && (!existing.lastOrderDate || orderDate > existing.lastOrderDate)) {
      existing.lastOrderDate = orderDate;
      existing.name = order.customer ?? order.shipping?.fullName ?? existing.name;
    }

    existing.purchaseHistory.push(...extractProductNames(order));
    byEmail.set(email, existing);
  });

  return Array.from(byEmail.values())
    .map((customer) => {
      const uniqueProducts = [...new Set(customer.purchaseHistory)].slice(-5).reverse();
      const abandonedCart = getMockAbandonedCart(customer.email, customer.orders);
      const segment = assignCustomerSegment({
        orders: customer.orders,
        ltv: customer.ltv,
        lastOrderDate: customer.lastOrderDate,
        abandonedCart,
      });

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        segment,
        orders: customer.orders,
        ltv: customer.ltv,
        purchaseHistory: uniqueProducts,
        abandonedCart,
      };
    })
    .sort((a, b) => b.ltv - a.ltv);
}
