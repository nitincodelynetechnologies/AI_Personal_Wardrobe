import { DEFAULT_MOCK_ORDERS, DEFAULT_SUPPORT_TICKETS } from '@/features/shared/constants/platformSeedData';

export const ORDERS_KEY = 'vton_orders';
export const TICKETS_KEY = 'vton_tickets';
export const LEGACY_ORDERS_KEY = 'vton_mock_orders';
export const LEGACY_TICKETS_KEY = 'vton_support_tickets';

export const ORDERS_UPDATED = 'vton-orders-updated';
export const TICKETS_UPDATED = 'vton-tickets-updated';

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

function parseJsonArray(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function dispatch(eventName) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName));
}

function createMessage(sender, text) {
  const at = new Date().toISOString();
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    role: sender,
    text: text.trim(),
    timestamp: at,
    at,
  };
}

function normalizeMessageEntry(message) {
  if (!message) return null;
  const sender = message.sender ?? message.role ?? 'user';
  const at = message.timestamp ?? message.at ?? new Date().toISOString();

  return {
    ...message,
    id: message.id ?? `msg-${at}`,
    sender,
    role: message.role ?? sender,
    text: String(message.text ?? '').trim(),
    timestamp: at,
    at,
  };
}

/** Build chat timeline from legacy fields or stored messages array. */
export function deriveTicketMessages(ticket) {
  if (Array.isArray(ticket.messages) && ticket.messages.length > 0) {
    return ticket.messages.map(normalizeMessageEntry).filter((entry) => entry?.text);
  }

  const messages = [];
  const baseAt = ticket.createdAt?.includes('T')
    ? ticket.createdAt
    : `${ticket.createdAt ?? new Date().toISOString().slice(0, 10)}T12:00:00.000Z`;

  if (ticket.message?.trim()) {
    messages.push(
      normalizeMessageEntry({
        id: `${ticket.id}-initial`,
        sender: 'user',
        text: ticket.message.trim(),
        timestamp: baseAt,
      }),
    );
  }

  if (ticket.adminReply?.trim()) {
    messages.push(
      normalizeMessageEntry({
        id: `${ticket.id}-reply`,
        sender: 'admin',
        text: ticket.adminReply.trim(),
        timestamp: baseAt,
      }),
    );
  }

  return messages.filter(Boolean);
}

export function getChatMessagesForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return [];

  return readTicketsForEmail(normalizedEmail)
    .flatMap(deriveTicketMessages)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function migrateLegacyStorage() {
  if (!safeRead(ORDERS_KEY)) {
    const legacyOrders = parseJsonArray(safeRead(LEGACY_ORDERS_KEY));
    if (legacyOrders?.length) {
      safeWrite(ORDERS_KEY, JSON.stringify(legacyOrders));
    }
  }

  if (!safeRead(TICKETS_KEY)) {
    const legacyTickets = parseJsonArray(safeRead(LEGACY_TICKETS_KEY));
    if (legacyTickets?.length) {
      const migrated = legacyTickets.map((ticket) => ({
        ...ticket,
        userUnread: ticket.userUnread ?? false,
        adminUnread: ticket.adminUnread ?? ticket.status === 'Open',
        status: ticket.status === 'Resolved' ? 'Answered' : ticket.status,
      }));
      safeWrite(TICKETS_KEY, JSON.stringify(migrated));
    }
  }
}

export function normalizePlatformOrder(order) {
  if (!order) return null;

  const checkoutItems = Array.isArray(order.items) ? order.items : null;
  const itemCount =
    typeof order.items === 'number'
      ? order.items
      : checkoutItems?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) ?? 0;

  const lineItems =
    order.lineItems ??
    (checkoutItems?.length
      ? checkoutItems.map((item) => ({
          name: item.name,
          variant: item.brand || '—',
          qty: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        }))
      : undefined);

  return {
    ...order,
    customer: order.customer ?? order.shipping?.fullName ?? 'Guest',
    email: (order.email ?? order.shipping?.email ?? '').toLowerCase(),
    amount: order.amount ?? order.total ?? 0,
    items: itemCount,
    date: order.date ?? order.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    products:
      order.products ??
      (checkoutItems?.length ? checkoutItems.map((item) => item.name) : []),
    lineItems,
    userUnreadUpdate: order.userUnreadUpdate ?? false,
  };
}

export function readOrders() {
  migrateLegacyStorage();

  const stored = parseJsonArray(safeRead(ORDERS_KEY));
  if (stored?.length) {
    return stored.map(normalizePlatformOrder).filter(Boolean);
  }

  safeWrite(ORDERS_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
  return DEFAULT_MOCK_ORDERS.map(normalizePlatformOrder);
}

/** Orders for analytics — no mock seeding; returns [] when storage is empty. */
export function readOrdersRaw() {
  migrateLegacyStorage();

  const stored = parseJsonArray(safeRead(ORDERS_KEY));
  if (!stored?.length) return [];

  return stored.map(normalizePlatformOrder).filter(Boolean);
}

export function writeOrders(orders) {
  const normalized = orders.map(normalizePlatformOrder).filter(Boolean);
  const ok = safeWrite(ORDERS_KEY, JSON.stringify(normalized));
  if (ok) dispatch(ORDERS_UPDATED);
  return ok;
}

export function saveCheckoutOrder(checkoutOrder) {
  const lineItems = (checkoutOrder.items ?? []).map((item) => ({
    name: item.name,
    variant: item.brand ? item.brand : 'Standard',
    qty: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
  }));

  const platformOrder = normalizePlatformOrder({
    id: checkoutOrder.id,
    customer: checkoutOrder.shipping?.fullName ?? 'Guest',
    email: checkoutOrder.shipping?.email ?? '',
    amount: checkoutOrder.total,
    status: 'Pending',
    items: checkoutOrder.items,
    date: checkoutOrder.createdAt?.slice(0, 10),
    products: checkoutOrder.items?.map((item) => item.name) ?? [],
    lineItems,
    paymentMethod: checkoutOrder.paymentMethod,
    shipping: checkoutOrder.shipping,
    source: 'checkout',
    createdAt: checkoutOrder.createdAt,
    userUnreadUpdate: false,
  });

  const orders = readOrders();
  writeOrders([platformOrder, ...orders.filter((order) => order.id !== platformOrder.id)]);
  return platformOrder;
}

export function updateOrderStatus(orderId, status) {
  const orders = readOrders().map((order) => {
    if (order.id !== orderId) return order;
    if (order.status === status) return order;
    return { ...order, status, userUnreadUpdate: true };
  });
  writeOrders(orders);
  return orders;
}

export function getUnreadOrderUpdateCount(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return 0;

  return readOrders().filter(
    (order) => order.email === normalizedEmail && order.userUnreadUpdate === true,
  ).length;
}

export function getUnreadOrderUpdatesForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return [];

  return readOrders().filter(
    (order) => order.email === normalizedEmail && order.userUnreadUpdate === true,
  );
}

export function markOrderUpdatesReadForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return readOrders();

  const orders = readOrders().map((order) =>
    order.email === normalizedEmail ? { ...order, userUnreadUpdate: false } : order,
  );
  writeOrders(orders);
  return orders;
}

export function readOrdersForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return [];

  return readOrdersRaw().filter((order) => order.email === normalizedEmail);
}

export function readTickets() {
  migrateLegacyStorage();

  const stored = parseJsonArray(safeRead(TICKETS_KEY));
  if (stored?.length) {
    return stored.map((ticket) => ({
      ...ticket,
      adminUnread:
        ticket.adminUnread ?? (ticket.status === 'Open' || ticket.status === 'Updated'),
      userUnread: ticket.userUnread ?? false,
    }));
  }

  const seeded = DEFAULT_SUPPORT_TICKETS.map((ticket) => ({
    ...ticket,
    userUnread: false,
    adminUnread: ticket.status === 'Open',
    status: ticket.status === 'Resolved' ? 'Answered' : ticket.status,
  }));
  safeWrite(TICKETS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function writeTickets(tickets) {
  const ok = safeWrite(TICKETS_KEY, JSON.stringify(tickets));
  if (ok) dispatch(TICKETS_UPDATED);
  return ok;
}

export function createSupportTicket({ user, email, subject, message }) {
  const trimmedMessage = message.trim();
  const initialMessage = createMessage('user', trimmedMessage);

  const ticket = {
    id: `TKT-${Date.now()}`,
    user: user || 'Guest',
    email: (email ?? '').trim().toLowerCase(),
    subject: subject.trim(),
    message: trimmedMessage,
    messages: [initialMessage],
    status: 'Open',
    adminReply: '',
    userUnread: false,
    adminUnread: true,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  writeTickets([ticket, ...readTickets()]);
  return ticket;
}

export function appendUserChatMessage({ user, email, text }) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  const trimmed = text.trim();
  if (!normalizedEmail || !trimmed) return null;

  const tickets = readTickets();
  const userTickets = tickets.filter((ticket) => ticket.email === normalizedEmail);
  const targetTicket =
    userTickets.find((ticket) => ticket.status === 'Open' || ticket.status === 'Updated') ??
    userTickets.find((ticket) => ticket.status === 'Answered') ??
    userTickets[0];
  const newMessage = createMessage('user', trimmed);

  if (targetTicket) {
    const updated = {
      ...targetTicket,
      messages: [...deriveTicketMessages(targetTicket), newMessage],
      status: targetTicket.status === 'Answered' ? 'Updated' : 'Open',
      userUnread: false,
      adminUnread: true,
    };

    writeTickets(tickets.map((ticket) => (ticket.id === targetTicket.id ? updated : ticket)));
    return updated;
  }

  const ticket = {
    id: `TKT-${Date.now()}`,
    user: user || 'Guest',
    email: normalizedEmail,
    subject: trimmed.length > 50 ? `${trimmed.slice(0, 47)}…` : trimmed,
    message: trimmed,
    messages: [newMessage],
    status: 'Open',
    adminReply: '',
    userUnread: false,
    adminUnread: true,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  writeTickets([ticket, ...tickets]);
  return ticket;
}

export function updateTicketReply(ticketId, adminReply) {
  const reply = adminReply.trim();
  const tickets = readTickets().map((ticket) => {
    if (ticket.id !== ticketId) return ticket;

    const messages = reply
      ? [...deriveTicketMessages(ticket), createMessage('admin', reply)]
      : deriveTicketMessages(ticket);

    return {
      ...ticket,
      messages,
      adminReply: reply || ticket.adminReply,
      status: reply ? 'Answered' : ticket.status,
      userUnread: Boolean(reply),
      adminUnread: false,
    };
  });
  writeTickets(tickets);
  return tickets;
}

export function getAdminUnreadTicketCount() {
  return readTickets().filter((ticket) => ticket.adminUnread === true).length;
}

export function markAdminTicketRead(ticketId) {
  const tickets = readTickets().map((ticket) =>
    ticket.id === ticketId ? { ...ticket, adminUnread: false } : ticket,
  );
  writeTickets(tickets);
  return tickets;
}

export function getUnreadTicketCount(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return 0;

  return readTickets().filter(
    (ticket) => ticket.email === normalizedEmail && ticket.userUnread === true,
  ).length;
}

export function getUnreadTicketsForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return [];

  return readTickets().filter(
    (ticket) => ticket.email === normalizedEmail && ticket.userUnread === true,
  );
}

export function markTicketsReadForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return readTickets();

  const tickets = readTickets().map((ticket) =>
    ticket.email === normalizedEmail ? { ...ticket, userUnread: false } : ticket,
  );
  writeTickets(tickets);
  return tickets;
}

export function readTicketsForEmail(email) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return [];
  return readTickets().filter((ticket) => ticket.email === normalizedEmail);
}
