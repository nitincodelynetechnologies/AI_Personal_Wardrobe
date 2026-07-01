import {
  createSupportTicket as syncCreateSupportTicket,
  getAdminUnreadTicketCount as syncGetAdminUnreadTicketCount,
  markAdminTicketRead as syncMarkAdminTicketRead,
  readTickets,
  TICKETS_KEY,
  TICKETS_UPDATED,
  updateTicketReply as syncUpdateTicketReply,
} from '@/features/shared/storage/platformSyncStorage';

export { TICKETS_KEY, TICKETS_UPDATED as ADMIN_TICKETS_UPDATED };
export const CRM_USERS_KEY = 'vton_crm_users';
export const ADMIN_CRM_UPDATED = 'admin-crm-updated';
export const ORDER_PIPELINE = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const VTON_TODAY_STATS = {
  sessionsToday: 247,
  successRate: 92,
  trendingItem: {
    name: '3D Urban Bomber Jacket',
    tryCount: 89,
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80&auto=format&fit=crop',
  },
};

export { DEFAULT_MOCK_ORDERS, DEFAULT_SUPPORT_TICKETS } from '@/features/shared/constants/platformSeedData';

export const DEFAULT_CRM_USERS = [  {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya@email.com',
    segment: 'VIP',
    orders: 12,
    ltv: 48200,
    purchaseHistory: ['Silk Midi Dress', '3D Linen Shirt', 'Urban Runner Sneakers'],
    abandonedCart: null,
  },
  {
    id: 'u2',
    name: 'Arjun Mehta',
    email: 'arjun@email.com',
    segment: 'Regular',
    orders: 4,
    ltv: 15600,
    purchaseHistory: ['Tailored Charcoal Suit', 'Structured Bomber Jacket'],
    abandonedCart: 'Premium 3D Linen Shirt',
  },
  {
    id: 'u3',
    name: 'Sneha Reddy',
    email: 'sneha@email.com',
    segment: 'New',
    orders: 1,
    ltv: 3499,
    purchaseHistory: ['Evening Midi Dress'],
    abandonedCart: '3D Urban Bomber Jacket, Slim Fit Denim',
  },
  {
    id: 'u4',
    name: 'Rahul Kapoor',
    email: 'rahul@email.com',
    segment: 'At Risk',
    orders: 2,
    ltv: 11200,
    purchaseHistory: ['3D Formal Blazer'],
    abandonedCart: 'Chelsea Leather Boot',
  },
  {
    id: 'u5',
    name: 'Ananya Iyer',
    email: 'ananya@email.com',
    segment: 'VIP',
    orders: 8,
    ltv: 36400,
    purchaseHistory: ['3D Utility Field Jacket', 'Sculpted Stiletto Heel'],
    abandonedCart: null,
  },
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

export function readCrmUsers() {
  const stored = parseJson(safeRead(CRM_USERS_KEY), null);
  if (stored?.length) return stored;
  safeWrite(CRM_USERS_KEY, JSON.stringify(DEFAULT_CRM_USERS));
  return DEFAULT_CRM_USERS;
}

export function readSupportTickets() {
  return readTickets();
}

export function updateTicketReply(ticketId, adminReply) {
  return syncUpdateTicketReply(ticketId, adminReply);
}

export function getAdminUnreadTicketCount() {
  return syncGetAdminUnreadTicketCount();
}

export function markAdminTicketRead(ticketId) {
  return syncMarkAdminTicketRead(ticketId);
}

export { syncCreateSupportTicket as createSupportTicket };