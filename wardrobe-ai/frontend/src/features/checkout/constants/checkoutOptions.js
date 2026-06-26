import { Building2, CreditCard, Smartphone, Wallet } from 'lucide-react';

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', description: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', description: 'All major Indian banks', icon: Building2 },
  { id: 'wallet', label: 'Wallet', description: 'Amazon Pay, Mobikwik', icon: Wallet },
];

export const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
];

export const CHECKOUT_PROCESSING_MS = 2200;

export function generateOrderId() {
  const suffix = Math.floor(80000 + Math.random() * 19999);
  return `ORD-${suffix}`;
}

export function formatOrderDisplayId(orderId) {
  return orderId.startsWith('#') ? orderId : `#${orderId}`;
}
