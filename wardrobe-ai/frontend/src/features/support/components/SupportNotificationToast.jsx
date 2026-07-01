'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupportNotifications } from '@/features/shared/hooks/useSupportNotifications';
import { useOrderHistoryStore } from '@/features/orders/store/useOrderHistoryStore';
import { useSupportChatStore } from '@/features/support/store/useSupportChatStore';

const TOAST_DURATION_MS = 5000;

function getTicketSignature(tickets) {
  return tickets
    .map((ticket) => `${ticket.id}@${ticket.adminReply ?? ''}`)
    .sort()
    .join('||');
}

function getOrderSignature(orders) {
  return orders
    .map((order) => `${order.id}@${order.status}`)
    .sort()
    .join('||');
}

export function SupportNotificationToast() {
  const { unreadTicketCount, unreadOrderCount, unreadTickets, unreadOrders } =
    useSupportNotifications();
  const isChatOpen = useSupportChatStore((state) => state.isOpen);
  const isOrderHistoryOpen = useOrderHistoryStore((state) => state.isOpen);
  const openChat = useSupportChatStore((state) => state.openChat);
  const openOrderHistory = useOrderHistoryStore((state) => state.openOrderHistory);

  const [toast, setToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const prevTicketSigRef = useRef('');
  const prevOrderSigRef = useRef('');
  const initializedRef = useRef(false);
  const hideTimerRef = useRef(null);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    window.setTimeout(() => {
      setToast(null);
      setIsExiting(false);
    }, 280);
  }, []);

  const showToast = useCallback(
    (payload) => {
      setToast(payload);
      setIsExiting(false);

      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        dismiss();
        hideTimerRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [dismiss],
  );

  useEffect(() => {
    const ticketSignature = getTicketSignature(unreadTickets);
    const orderSignature = getOrderSignature(unreadOrders);

    if (!initializedRef.current) {
      initializedRef.current = true;
      prevTicketSigRef.current = ticketSignature;
      prevOrderSigRef.current = orderSignature;
      return;
    }

    const hasNewOrder =
      unreadOrderCount > 0 &&
      orderSignature !== prevOrderSigRef.current &&
      orderSignature.length > 0 &&
      !isOrderHistoryOpen;

    const hasNewTicket =
      unreadTicketCount > 0 &&
      ticketSignature !== prevTicketSigRef.current &&
      ticketSignature.length > 0 &&
      !isChatOpen;

    prevTicketSigRef.current = ticketSignature;
    prevOrderSigRef.current = orderSignature;

    if (hasNewOrder && unreadOrders[0]) {
      const order = unreadOrders[0];
      showToast({
        type: 'order',
        title: 'Order Update',
        message: `Your order ${order.id} is now ${order.status}!`,
        action: () => openOrderHistory(),
      });
      return;
    }

    if (hasNewTicket) {
      showToast({
        type: 'support',
        title: 'Support Team',
        message: 'You have a new message!',
        action: () => openChat(),
      });
    }
  }, [
    unreadTickets,
    unreadOrders,
    unreadTicketCount,
    unreadOrderCount,
    isChatOpen,
    isOrderHistoryOpen,
    showToast,
    openChat,
    openOrderHistory,
  ]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    },
    [],
  );

  if (!toast) return null;

  const Icon = toast.type === 'order' ? Package : MessageSquare;
  const iconClass =
    toast.type === 'order'
      ? 'bg-violet/15 text-violet'
      : 'bg-magenta/15 text-magenta';
  const actionLabel = toast.type === 'order' ? 'Tap to view orders' : 'Tap to open chat';

  const handleAction = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    dismiss();
    toast.action?.();
  };

  return (
    <div
      className={cn(
        'fixed right-4 top-4 z-[70] w-[min(calc(100vw-2rem),360px)]',
        isExiting ? 'support-toast-exit' : 'support-toast-enter',
      )}
      role="alert"
      aria-live="assertive"
    >
      <button
        type="button"
        onClick={handleAction}
        className="group flex w-full items-start gap-3 rounded-2xl border border-magenta/25 bg-white p-4 text-left shadow-[0_16px_48px_rgba(233,30,140,0.18)] transition-transform hover:scale-[1.01] dark:border-magenta/30 dark:bg-[#150d22]"
      >
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconClass)}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-bold text-slate-900 dark:text-white">{toast.title}</span>
          <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-300">{toast.message}</span>
          <span className="mt-1 block text-xs text-magenta">{actionLabel}</span>
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            dismiss();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              dismiss();
            }
          }}
          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}
