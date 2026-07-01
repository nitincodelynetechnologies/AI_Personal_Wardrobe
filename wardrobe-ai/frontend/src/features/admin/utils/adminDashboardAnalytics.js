import { DEFAULT_GARMENTS } from '@/features/catalog/constants/catalogProducts';
import { readGlobalCatalog } from '@/features/catalog/utils/globalCatalogStorage';
import {
  ADMIN_DASHBOARD_KPIS,
  ADMIN_KPI_GRAPH_DATA,
  formatAdminCurrency,
} from '@/features/admin/constants/adminMockData';

export const PRODUCTS_KEY = 'vton_products';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS = {
  Dresses: '#ec4899',
  Tops: '#8b5cf6',
  Outerwear: '#0ea5e9',
  Trousers: '#f59e0b',
  Footwear: '#10b981',
  Accessories: '#6366f1',
  Other: '#94a3b8',
};

const INVALID_ORDER_STATUSES = new Set(['cancelled', 'canceled', 'refunded']);

function safeRead(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseJsonArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

function normalizeProductRecord(product) {
  if (!product || typeof product !== 'object') return null;

  const name = (product.name ?? '').trim();
  if (!name) return null;

  return {
    id: product.id != null ? String(product.id) : null,
    name,
    category: product.category ?? product.type ?? null,
    price: Number(product.price) || 0,
  };
}

/** Read product catalog for category lookups — `vton_products` with fallbacks. */
export function readProductsForAnalytics() {
  const merged = [];
  const seen = new Set();

  const sources = [
    ...parseJsonArray(safeRead(PRODUCTS_KEY)),
    ...readGlobalCatalog(),
    ...DEFAULT_GARMENTS,
  ];

  for (const entry of sources) {
    const normalized = normalizeProductRecord(entry);
    if (!normalized) continue;

    const key = normalized.id ?? normalized.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(normalized);
  }

  return merged;
}

function buildProductIndex(products) {
  const byId = new Map();
  const byName = new Map();

  products.forEach((product) => {
    if (product.id) byId.set(String(product.id), product);
    byName.set(product.name.toLowerCase(), product);
  });

  return { byId, byName };
}

function normalizeSalesCategory(raw) {
  const value = (raw ?? '').trim();
  if (!value) return null;

  const lower = value.toLowerCase();

  if (lower.includes('dress')) return 'Dresses';
  if (lower === 'tops' || lower === 'top') return 'Tops';
  if (lower.includes('outer') || lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer')) {
    return 'Outerwear';
  }
  if (
    lower.includes('bottom') ||
    lower.includes('trouser') ||
    lower.includes('pant') ||
    lower.includes('denim')
  ) {
    return 'Trousers';
  }
  if (
    lower.includes('shoe') ||
    lower.includes('foot') ||
    lower.includes('sneaker') ||
    lower.includes('boot')
  ) {
    return 'Footwear';
  }
  if (lower.includes('accessor')) return 'Accessories';
  if (lower === 'men' || lower === 'women') return 'Tops';

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function inferCategoryFromName(name) {
  const lower = (name ?? '').toLowerCase();
  if (!lower) return 'Other';

  if (lower.includes('dress')) return 'Dresses';
  if (lower.includes('blazer') || lower.includes('jacket') || lower.includes('coat')) return 'Outerwear';
  if (lower.includes('trouser') || lower.includes('denim') || lower.includes('pant')) return 'Trousers';
  if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('boot')) return 'Footwear';
  if (lower.includes('tee') || lower.includes('shirt') || lower.includes('hoodie') || lower.includes('sweater')) {
    return 'Tops';
  }

  return 'Other';
}

function resolveItemCategory(item, productIndex) {
  if (item?.category) {
    return normalizeSalesCategory(item.category) ?? inferCategoryFromName(item.name);
  }

  if (item?.id && productIndex.byId.has(String(item.id))) {
    const product = productIndex.byId.get(String(item.id));
    return normalizeSalesCategory(product.category) ?? inferCategoryFromName(product.name);
  }

  if (item?.name) {
    const byName = productIndex.byName.get(item.name.toLowerCase());
    if (byName) {
      return normalizeSalesCategory(byName.category) ?? inferCategoryFromName(byName.name);
    }
  }

  return inferCategoryFromName(item?.name);
}

function getOrderLineItems(order) {
  if (Array.isArray(order?.items) && order.items.length > 0 && typeof order.items[0] === 'object') {
    return order.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));
  }

  if (Array.isArray(order?.lineItems) && order.lineItems.length > 0) {
    return order.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.qty) || Number(item.quantity) || 1),
    }));
  }

  const productNames = Array.isArray(order?.products) ? order.products : [];
  if (!productNames.length) {
    return [{ name: 'Order total', category: null, price: getOrderAmount(order), quantity: 1 }];
  }

  const perUnit = Math.floor(getOrderAmount(order) / productNames.length);
  const remainder = getOrderAmount(order) - perUnit * productNames.length;

  return productNames.map((name, index) => ({
    name,
    category: null,
    price: perUnit + (index === productNames.length - 1 ? remainder : 0),
    quantity: 1,
  }));
}

function buildEmptyWeek() {
  const now = new Date();
  const points = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    points.push({ name: DAY_SHORT[date.getDay()], value: 0 });
  }

  return points;
}

function buildWeeklySeries(orders, type) {
  const now = new Date();
  const points = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    points.push({
      name: DAY_SHORT[date.getDay()],
      value: 0,
      dateKey: date.toDateString(),
    });
  }

  orders.forEach((order) => {
    const orderDate = parseOrderDate(order);
    if (!orderDate) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const index = points.findIndex((point) => point.dateKey === normalized.toDateString());
    if (index === -1) return;

    if (type === 'revenue') {
      points[index].value += getOrderAmount(order);
    } else if (type === 'orders') {
      points[index].value += 1;
    } else if (type === 'users') {
      points[index].value += 1;
    }
  });

  return points.map(({ name, value }) => ({ name, value }));
}

function buildWeeklyUniqueCustomers(orders) {
  const now = new Date();
  const buckets = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    buckets.push({
      name: DAY_SHORT[date.getDay()],
      dateKey: date.toDateString(),
      emails: new Set(),
    });
  }

  orders.forEach((order) => {
    const orderDate = parseOrderDate(order);
    const identity = (order.email ?? order.customer ?? '').trim().toLowerCase();
    if (!orderDate || !identity) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const bucket = buckets.find((entry) => entry.dateKey === normalized.toDateString());
    if (bucket) bucket.emails.add(identity);
  });

  return buckets.map(({ name, emails }) => ({ name, value: emails.size }));
}

function buildMonthlyRevenueSeries(orders) {
  const now = new Date();
  const points = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    points.push({
      month: MONTH_SHORT[date.getMonth()],
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      revenue: 0,
      growth: 0,
    });
  }

  orders.forEach((order) => {
    const orderDate = parseOrderDate(order);
    if (!orderDate) return;

    const bucket = points.find(
      (point) => point.year === orderDate.getFullYear() && point.monthIndex === orderDate.getMonth(),
    );
    if (bucket) bucket.revenue += getOrderAmount(order);
  });

  points.forEach((point, index) => {
    const previous = index > 0 ? points[index - 1].revenue : 0;
    point.growth = previous > 0 ? Number((((point.revenue - previous) / previous) * 100).toFixed(1)) : 0;
  });

  return points.map(({ month, revenue, growth }) => ({ month, revenue, growth }));
}

function buildRevenueVsTargetSeries(orders) {
  const monthly = buildMonthlyRevenueSeries(orders);
  const averageRevenue =
    monthly.length > 0
      ? monthly.reduce((sum, point) => sum + point.revenue, 0) / monthly.length
      : 0;

  return monthly.map((point) => ({
    month: point.month,
    revenue: point.revenue,
    target: point.revenue > 0 ? Math.round(point.revenue * 1.1) : Math.round(averageRevenue * 1.05),
  }));
}

export function computeCategorySales(orders = [], products = []) {
  const productIndex = buildProductIndex(products);
  const totalsByCategory = {};

  orders.filter(isValidOrder).forEach((order) => {
    getOrderLineItems(order).forEach((item) => {
      const category = resolveItemCategory(item, productIndex);
      const lineRevenue = item.price * item.quantity;
      totalsByCategory[category] = (totalsByCategory[category] ?? 0) + lineRevenue;
    });
  });

  const grandTotal = Object.values(totalsByCategory).reduce((sum, value) => sum + value, 0);
  if (grandTotal <= 0) return [];

  return Object.entries(totalsByCategory)
    .map(([name, revenue]) => ({
      name,
      revenue,
      value: Math.round((revenue / grandTotal) * 100),
      fill: CATEGORY_COLORS[name] ?? CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeAdminDashboardMetrics(orders = [], products = readProductsForAnalytics()) {
  const validOrders = orders.filter(isValidOrder);
  const productCatalog = products.length ? products : readProductsForAnalytics();

  const totalRevenue = validOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);
  const totalOrders = validOrders.length;
  const uniqueCustomers = new Set(
    validOrders.map((order) => (order.email ?? order.customer ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const kpis = ADMIN_DASHBOARD_KPIS.map((card) => {
    switch (card.metricKey) {
      case 'revenue':
        return {
          ...card,
          label: 'Total Revenue',
          value: formatAdminCurrency(totalRevenue),
          trend: totalRevenue > 0 ? 'Live' : '—',
          trendUp: totalRevenue > 0,
          caption: 'from valid orders',
        };
      case 'orders':
        return {
          ...card,
          label: 'Total Orders',
          value: String(totalOrders),
          trend: totalOrders > 0 ? 'Live' : '—',
          trendUp: totalOrders > 0,
          caption: 'non-cancelled orders',
        };
      case 'users':
        return {
          ...card,
          label: 'Active Customers',
          value: uniqueCustomers.size.toLocaleString('en-IN'),
          trend: uniqueCustomers.size > 0 ? 'Live' : '—',
          trendUp: uniqueCustomers.size > 0,
          caption: 'unique buyers',
        };
      case 'tryons':
        return {
          ...card,
          value: '0',
          trend: '—',
          trendUp: false,
          caption: 'awaiting VTON telemetry',
        };
      default:
        return card;
    }
  });

  const graphData = {
    revenue: buildWeeklySeries(validOrders, 'revenue'),
    orders: buildWeeklySeries(validOrders, 'orders'),
    users: buildWeeklyUniqueCustomers(validOrders),
    accuracy: buildEmptyWeek(),
    conversion: buildEmptyWeek(),
    tryons: buildEmptyWeek(),
  };

  return {
    kpis,
    graphData,
    monthlyRevenueData: buildMonthlyRevenueSeries(validOrders),
    categorySalesData: computeCategorySales(validOrders, productCatalog),
    revenueVsTargetData: buildRevenueVsTargetSeries(validOrders),
    totals: {
      revenue: totalRevenue,
      orders: totalOrders,
      users: uniqueCustomers.size,
    },
  };
}

/** @deprecated baseline removed — analytics are fully live from localStorage */
export const ADMIN_ANALYTICS_BASELINE = {
  revenue: 0,
  orders: 0,
  users: 0,
};

/** Empty week template for charts with no telemetry source */
export { ADMIN_KPI_GRAPH_DATA };
