'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mail, MessageSquare, MessagesSquare, Send, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import { AdminCard } from '@/features/admin/components/AdminCard';
import { ProductMetricsPanel } from '@/features/admin/components/ProductMetricsPanel';
import {
  formatAdminCurrency,
  MOST_TRIED_PRODUCTS,
} from '@/features/admin/constants/adminMockData';
import {
  ADMIN_TICKETS_UPDATED,
  markAdminTicketRead,
  readSupportTickets,
  updateTicketReply,
} from '@/features/admin/storage/adminCrmStorage';
import { aggregateCustomersFromOrders } from '@/features/admin/utils/adminCustomerAnalytics';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import {
  deriveTicketMessages,
  ORDERS_UPDATED,
} from '@/features/shared/storage/platformSyncStorage';

const TICKETS_STORAGE_KEY = 'vton_tickets';

const SEGMENT_STYLES = {
  VIP: 'bg-magenta/15 text-magenta border-magenta/30',
  Regular: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  New: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'At Risk': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const TICKET_STATUS_STYLES = {
  Open: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Updated: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Answered: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

function getTicketStatusStyle(status) {
  return TICKET_STATUS_STYLES[status] ?? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
}

function getAdminReplyHistory(ticket) {
  return deriveTicketMessages(ticket).filter(
    (entry) => (entry.sender ?? entry.role) === 'admin',
  );
}

function TicketListItem({ ticket, isActive, onSelect }) {
  const isUnread = Boolean(ticket.adminUnread);

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket.id)}
      className={cn(
        'relative w-full border-b border-borderColor/60 px-4 py-3.5 text-left transition-colors dark:border-white/5',
        isActive
          ? 'border-l-[3px] border-l-magenta bg-magenta/10 dark:bg-magenta/15'
          : 'border-l-[3px] border-l-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]',
        isUnread && !isActive && 'bg-red-500/[0.04]',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            isUnread ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-transparent',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {ticket.user || 'Customer'}
            </p>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                getTicketStatusStyle(ticket.status),
              )}
            >
              {ticket.status}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{ticket.email}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-magenta">{ticket.id}</span>
            {ticket.subject && (
              <span className="truncate text-[10px] text-slate-400">{ticket.subject}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function formatCompactChatTime(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function ChatBubble({ entry }) {
  const sender = entry.sender ?? entry.role ?? 'user';
  const isAdmin = sender === 'admin';
  const timeLabel = formatCompactChatTime(entry.timestamp ?? entry.at);

  return (
    <div className={cn('flex w-full', isAdmin ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative w-fit max-w-[70%] rounded-lg p-2.5 shadow-sm',
          isAdmin
            ? 'rounded-tr-none bg-[#ec4899] text-white'
            : 'rounded-tl-none bg-slate-100 text-gray-900 dark:bg-gray-800 dark:text-white',
        )}
      >
        <p className="whitespace-pre-wrap pr-12 text-sm leading-relaxed">{entry.text}</p>
        <span
          className={cn(
            'absolute bottom-1.5 right-2 text-[10px] opacity-60 whitespace-nowrap',
            isAdmin ? 'text-white' : 'text-gray-500 dark:text-gray-400',
          )}
        >
          {timeLabel}
        </span>
      </div>
    </div>
  );
}

function TicketChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-magenta/10 ring-1 ring-magenta/20">
        <MessagesSquare className="h-8 w-8 text-magenta" aria-hidden />
      </div>
      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">No ticket selected</h4>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Select a ticket from the left to view the conversation and send a resolution.
      </p>
    </div>
  );
}

function TicketChatView({ ticket, onReply, onMarkRead }) {
  const [replyDraft, setReplyDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const adminReplies = getAdminReplyHistory(ticket);
  const messages = deriveTicketMessages(ticket);

  useEffect(() => {
    if (ticket.adminUnread) {
      markAdminTicketRead(ticket.id);
      onMarkRead?.();
    }
  }, [ticket.id, ticket.adminUnread, onMarkRead]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [ticket.id, messages.length]);

  const handleMarkRead = () => {
    if (ticket.adminUnread) {
      markAdminTicketRead(ticket.id);
      onMarkRead?.();
    }
  };

  const handleSend = () => {
    const text = replyDraft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    onReply(ticket.id, text);
    setReplyDraft('');
    setIsSending(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-borderColor bg-slate-50/80 px-5 py-4 dark:border-white/5 dark:bg-black/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-magenta">Active Ticket</p>
            <h4 className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-white">
              {ticket.user || 'Customer'}
            </h4>
            <p className="truncate text-sm text-slate-500">{ticket.email}</p>
            <p className="mt-1 font-mono text-xs text-slate-400">{ticket.id}</p>
          </div>
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
              getTicketStatusStyle(ticket.status),
            )}
          >
            {ticket.status}
          </span>
        </div>
        {ticket.subject && (
          <p className="mt-3 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
            {ticket.subject}
          </p>
        )}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No messages yet.</p>
        ) : (
          messages.map((entry) => <ChatBubble key={entry.id} entry={entry} />)
        )}
      </div>

      <div className="shrink-0 border-t border-borderColor bg-white px-5 py-4 dark:border-white/5 dark:bg-[#0f0818]">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {adminReplies.length > 0 ? 'Send Follow-up Reply' : 'Admin Reply / Resolution'}
        </label>
        <textarea
          value={replyDraft}
          onChange={(event) => setReplyDraft(event.target.value)}
          onFocus={handleMarkRead}
          rows={3}
          placeholder={
            adminReplies.length > 0
              ? 'Type a follow-up message for the customer…'
              : 'Type your resolution for the customer…'
          }
          className="w-full resize-none rounded-xl border border-borderColor bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/20 dark:border-white/10 dark:bg-[#150d22] dark:text-white"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !replyDraft.trim()}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          Send Resolution
        </button>
      </div>
    </div>
  );
}

function SupportTicketsMasterDetail({ tickets, onReply, onMarkRead }) {
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId],
  );

  const attentionCount = tickets.filter(
    (ticket) => ticket.status === 'Open' || ticket.status === 'Updated',
  ).length;

  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    markAdminTicketRead(ticketId);
    onMarkRead?.();
  };

  return (
    <div className="flex h-[80vh] min-h-[520px] flex-col overflow-hidden rounded-xl border border-borderColor dark:border-white/10">
      <div className="flex shrink-0 items-center gap-2 border-b border-borderColor bg-slate-50/50 px-4 py-3 dark:border-white/5 dark:bg-black/20">
        <MessageSquare className="h-5 w-5 text-magenta" aria-hidden />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Support Tickets</h3>
        <span className="ml-auto text-xs text-slate-500">{attentionCount} need attention</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(280px,33%)_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-borderColor dark:border-white/5 lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-borderColor px-4 py-2.5 dark:border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Inbox · {tickets.length} tickets
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No support tickets yet.</p>
            ) : (
              tickets.map((ticket) => (
                <TicketListItem
                  key={ticket.id}
                  ticket={ticket}
                  isActive={selectedTicketId === ticket.id}
                  onSelect={handleSelectTicket}
                />
              ))
            )}
          </div>
        </aside>

        <section className="min-h-0 bg-white dark:bg-[#0a0612]">
          {selectedTicket ? (
            <TicketChatView
              key={selectedTicket.id}
              ticket={selectedTicket}
              onReply={onReply}
              onMarkRead={onMarkRead}
            />
          ) : (
            <TicketChatEmptyState />
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminCustomersPanel() {
  const showToast = useToastStore((state) => state.showToast);
  const { orders, refresh: refreshOrders } = useAdminOrders();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  const refresh = useCallback(() => {
    setUsers(aggregateCustomersFromOrders(orders));
    setTickets(readSupportTickets());
  }, [orders]);

  const vipCount = useMemo(
    () => users.filter((user) => user.segment === 'VIP').length,
    [users],
  );

  const atRiskCount = useMemo(
    () => users.filter((user) => user.segment === 'At Risk').length,
    [users],
  );

  const handleEmailVips = () => {
    showToast({
      message: `Sending 'Premium Early Access' emails to ${vipCount} VIP customer${vipCount === 1 ? '' : 's'}…`,
      variant: 'success',
    });
  };

  const handleWinBackAtRisk = () => {
    showToast({
      message: `Sending '20% Discount Coupon' emails to ${atRiskCount} At-Risk customer${atRiskCount === 1 ? '' : 's'}…`,
      variant: 'success',
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (!raw) return;

      const storedTickets = JSON.parse(raw);
      if (!Array.isArray(storedTickets)) return;

      const hasUnread = storedTickets.some((ticket) => ticket.adminUnread === true);
      if (!hasUnread) return;

      const updatedTickets = storedTickets.map((ticket) => ({
        ...ticket,
        adminUnread: false,
      }));

      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updatedTickets));
      window.dispatchEvent(new Event('ticketsUpdated'));
      window.dispatchEvent(new CustomEvent(ADMIN_TICKETS_UPDATED));
    } catch {
      // Ignore malformed localStorage payloads.
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(ADMIN_TICKETS_UPDATED, refresh);
    window.addEventListener(ORDERS_UPDATED, refresh);
    window.addEventListener('vton-orders-updated', refresh);

    const onStorage = (event) => {
      if (!event.key || event.key === 'vton_orders') refresh();
    };
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(refresh, 3000);

    return () => {
      window.removeEventListener(ADMIN_TICKETS_UPDATED, refresh);
      window.removeEventListener(ORDERS_UPDATED, refresh);
      window.removeEventListener('vton-orders-updated', refresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const handleTicketReply = (ticketId, adminReply) => {
    updateTicketReply(ticketId, adminReply);
    refresh();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">CRM</p>
        <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">
          User & Customer Management
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Registered users, purchase history, abandoned carts, and support tickets — orders load live from the database.
        </p>
      </div>

      <AdminCard>
        <ProductMetricsPanel
          subtitle="Virtual Fitting Room"
          title="Top AI Tried Garments"
          products={MOST_TRIED_PRODUCTS}
          variant="ranked"
        />
      </AdminCard>

      <AdminCard>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-magenta" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer Profiles</h3>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Run Email Campaign
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleEmailVips}
                disabled={vipCount === 0}
                className="inline-flex items-center gap-2 rounded-full border border-magenta/30 bg-magenta/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-magenta transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Email VIPs ({vipCount})
              </button>
              <button
                type="button"
                onClick={handleWinBackAtRisk}
                disabled={atRiskCount === 0}
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-600 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:text-amber-400"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Win-back AT RISK ({atRiskCount})
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-borderColor bg-slate-50/80 dark:border-white/5 dark:bg-black/20">
                {['Customer', 'Segment', 'Orders', 'LTV', 'Purchase History', 'Abandoned Cart'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No customer profiles yet — orders from checkout will appear here automatically.
                  </td>
                </tr>
              ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-borderColor/60 dark:border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        SEGMENT_STYLES[user.segment] ?? 'border-white/10 text-slate-400',
                      )}
                    >
                      {user.segment}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{user.orders}</td>
                  <td className="px-4 py-3">{formatAdminCurrency(user.ltv)}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {user.purchaseHistory?.join(' · ') ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {user.abandonedCart ? (
                      <span className="inline-flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-600 dark:text-amber-400">
                        <ShoppingCart className="mt-0.5 h-3 w-3 shrink-0" />
                        {user.abandonedCart}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden p-0">
        <SupportTicketsMasterDetail
          tickets={tickets}
          onReply={handleTicketReply}
          onMarkRead={refresh}
        />
      </AdminCard>
    </div>
  );
}
