'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupportNotifications } from '@/features/shared/hooks/useSupportNotifications';
import { useOrderHistoryStore } from '@/features/orders/store/useOrderHistoryStore';
import { useSupportChatStore } from '@/features/support/store/useSupportChatStore';

const TOAST_DURATION_MS = 5000;

function getLatestStaffMessageKey(ticket) {
  const messages = ticket.messages ?? [];
  const staffMessages = messages.filter(
    (message) =>
      message.sender === 'admin' ||
      message.sender === 'bot' ||
      message.role === 'admin' ||
      message.role === 'bot',
  );
  const latest = staffMessages[staffMessages.length - 1];

  if (latest?.id) {
    return `${ticket.id}:${latest.id}`;
  }

  if (latest?.at || latest?.timestamp) {
    return `${ticket.id}:${latest.at ?? latest.timestamp}`;
  }

  return `${ticket.id}:${ticket.adminReply ?? ''}`;
}

function getUnreadTicketKeys(tickets = []) {
  return tickets.map(getLatestStaffMessageKey);
}

function getOrderNotificationKey(order) {
  return `${order.id}@${order.status}`;
}

function getUnreadOrderKeys(orders = []) {
  return orders.map(getOrderNotificationKey);
}

export function SupportNotificationToast() {
  const {
    unreadTicketCount,
    unreadOrderCount,
    unreadTickets,
    unreadOrders,
    markAllRead,
    markAllOrderUpdatesRead,
  } = useSupportNotifications();
  const isChatOpen = useSupportChatStore((state) => state.isOpen);
  const isOrderHistoryOpen = useOrderHistoryStore((state) => state.isOpen);
  const openChat = useSupportChatStore((state) => state.openChat);
  const openOrderHistory = useOrderHistoryStore((state) => state.openOrderHistory);

  const [toast, setToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const initializedRef = useRef(false);
  const hideTimerRef = useRef(null);
  const notifiedTicketKeysRef = useRef(new Set());
  const notifiedOrderKeysRef = useRef(new Set());
  const suppressedTicketKeysRef = useRef(new Set());
  const suppressedOrderKeysRef = useRef(new Set());
  const prevChatOpenRef = useRef(false);
  const prevOrderHistoryOpenRef = useRef(false);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    window.setTimeout(() => {
      setToast(null);
      setIsExiting(false);
    }, 280);
  }, []);

  const acknowledgeTicketKeys = useCallback((keys) => {
    keys.forEach((key) => {
      notifiedTicketKeysRef.current.add(key);
      suppressedTicketKeysRef.current.add(key);
    });
  }, []);

  const acknowledgeOrderKeys = useCallback((keys) => {
    keys.forEach((key) => {
      notifiedOrderKeysRef.current.add(key);
      suppressedOrderKeysRef.current.add(key);
    });
  }, []);

  const showToast = useCallback(
    (payload) => {
      setToast(payload);
      setIsExiting(false);

      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        if (payload.notificationKey) {
          if (payload.type === 'support') {
            notifiedTicketKeysRef.current.add(payload.notificationKey);
            suppressedTicketKeysRef.current.add(payload.notificationKey);
          }
          if (payload.type === 'order') {
            notifiedOrderKeysRef.current.add(payload.notificationKey);
            suppressedOrderKeysRef.current.add(payload.notificationKey);
          }
        }
        dismiss();
        hideTimerRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const dismissSupportToast = useCallback(() => {
    acknowledgeTicketKeys(getUnreadTicketKeys(unreadTickets));
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    dismiss();
  }, [acknowledgeTicketKeys, dismiss, unreadTickets]);

  const dismissOrderToast = useCallback(() => {
    acknowledgeOrderKeys(getUnreadOrderKeys(unreadOrders));
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    dismiss();
  }, [acknowledgeOrderKeys, dismiss, unreadOrders]);

  useEffect(() => {
    const justOpened = isChatOpen && !prevChatOpenRef.current;
    prevChatOpenRef.current = isChatOpen;

    if (!justOpened || unreadTicketCount === 0) return;

    acknowledgeTicketKeys(getUnreadTicketKeys(unreadTickets));
    markAllRead();

    if (toast?.type === 'support') {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      dismiss();
    }
  }, [
    isChatOpen,
    unreadTicketCount,
    unreadTickets,
    acknowledgeTicketKeys,
    markAllRead,
    toast?.type,
    dismiss,
  ]);

  useEffect(() => {
    const justOpened = isOrderHistoryOpen && !prevOrderHistoryOpenRef.current;
    prevOrderHistoryOpenRef.current = isOrderHistoryOpen;

    if (!justOpened || unreadOrderCount === 0) return;

    acknowledgeOrderKeys(getUnreadOrderKeys(unreadOrders));
    markAllOrderUpdatesRead();

    if (toast?.type === 'order') {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      dismiss();
    }
  }, [
    isOrderHistoryOpen,
    unreadOrderCount,
    unreadOrders,
    acknowledgeOrderKeys,
    markAllOrderUpdatesRead,
    toast?.type,
    dismiss,
  ]);

  useEffect(() => {
    const ticketKeys = getUnreadTicketKeys(unreadTickets);
    const orderKeys = getUnreadOrderKeys(unreadOrders);

    if (!initializedRef.current) {
      initializedRef.current = true;
      ticketKeys.forEach((key) => notifiedTicketKeysRef.current.add(key));
      orderKeys.forEach((key) => notifiedOrderKeysRef.current.add(key));
      return;
    }

    if (isOrderHistoryOpen) {
      orderKeys.forEach((key) => notifiedOrderKeysRef.current.add(key));
    }

    if (isChatOpen) {
      ticketKeys.forEach((key) => notifiedTicketKeysRef.current.add(key));
    }

    const pendingOrderKey = orderKeys.find(
      (key) =>
        !notifiedOrderKeysRef.current.has(key) &&
        !suppressedOrderKeysRef.current.has(key),
    );

    if (
      pendingOrderKey &&
      unreadOrderCount > 0 &&
      !isOrderHistoryOpen &&
      unreadOrders[0]
    ) {
      notifiedOrderKeysRef.current.add(pendingOrderKey);
      const order = unreadOrders[0];
      showToast({
        type: 'order',
        notificationKey: pendingOrderKey,
        title: 'Order Update',
        message: `Your order ${order.id} is now ${order.status}!`,
        action: () => openOrderHistory(),
      });
      return;
    }

    const pendingTicketKey = ticketKeys.find(
      (key) =>
        !notifiedTicketKeysRef.current.has(key) &&
        !suppressedTicketKeysRef.current.has(key),
    );

    if (pendingTicketKey && unreadTicketCount > 0 && !isChatOpen) {
      notifiedTicketKeysRef.current.add(pendingTicketKey);
      showToast({
        type: 'support',
        notificationKey: pendingTicketKey,
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

  const handleDismiss = (event) => {
    event.stopPropagation();
    if (toast.type === 'order') {
      dismissOrderToast();
      return;
    }
    dismissSupportToast();
  };

  const handleAction = () => {
    if (toast.type === 'order') {
      acknowledgeOrderKeys(getUnreadOrderKeys(unreadOrders));
      markAllOrderUpdatesRead();
    } else {
      acknowledgeTicketKeys(getUnreadTicketKeys(unreadTickets));
      markAllRead();
    }

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
          onClick={handleDismiss}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              handleDismiss(event);
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
