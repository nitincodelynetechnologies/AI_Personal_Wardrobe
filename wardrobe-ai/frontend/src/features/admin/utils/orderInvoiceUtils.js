import { formatAdminCurrency, formatAdminDate } from '@/features/admin/constants/adminMockData';

export const INVOICE_TAX_RATE = 0.05;

export const INVOICE_COMPANY = {
  name: 'Wardrobe AI Pvt. Ltd.',
  tagline: 'AI Virtual Fashion Platform',
  address: '42 Fashion District, Bandra Kurla Complex',
  city: 'Mumbai, Maharashtra 400051, India',
  email: 'billing@wardrobeai.com',
  gstin: '27AABCU9603R1ZX',
};

const DEFAULT_VARIANTS = ['M / Black', 'L / Blue', 'S / Red', 'XL / Black', '32 / Indigo'];

/** Normalize mock orders (string products or rich lineItems) into printable rows. */
export function getOrderLineItems(order) {
  if (!order) return [];

  if (Array.isArray(order.lineItems) && order.lineItems.length > 0) {
    return order.lineItems.map((item) => ({
      name: item.name,
      variant: item.variant ?? '—',
      qty: Number(item.qty) || 1,
      price: Number(item.price) || 0,
    }));
  }

  const checkoutItems = Array.isArray(order.items) ? order.items : null;
  if (checkoutItems?.length && checkoutItems[0]?.name) {
    return checkoutItems.map((item) => ({
      name: item.name,
      variant: item.brand || '—',
      qty: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    }));
  }

  const grandTotal = Number(order.amount ?? order.total) || 0;
  const products = order.products ?? [];
  if (!products.length) {
    return [];
  }

  const subtotal = deriveSubtotalFromGrandTotal(grandTotal);
  const perUnit = Math.floor(subtotal / products.length);
  const remainder = subtotal - perUnit * products.length;

  return products.map((product, index) => {
    const name = typeof product === 'string' ? product : product.name;
    const variant =
      typeof product === 'object'
        ? `${product.size ?? 'M'} / ${product.color ?? 'Black'}`
        : DEFAULT_VARIANTS[index % DEFAULT_VARIANTS.length];

    const extra = index === 0 ? remainder : 0;
    return { name, variant, qty: 1, price: perUnit + extra };
  });
}

function deriveSubtotalFromGrandTotal(grandTotal) {
  const total = Number(grandTotal) || 0;
  return Math.round(total / (1 + INVOICE_TAX_RATE));
}

export function computeInvoiceTotals(order) {
  const lineItems = getOrderLineItems(order);
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * INVOICE_TAX_RATE);
  const grandTotal = subtotal + tax;

  return { lineItems, subtotal, tax, grandTotal };
}

export function formatInvoiceDate(dateString) {
  if (!dateString) return '—';
  try {
    return formatAdminDate(dateString);
  } catch {
    return dateString;
  }
}

export function formatLineTotal(item) {
  return formatAdminCurrency(item.price * item.qty);
}
