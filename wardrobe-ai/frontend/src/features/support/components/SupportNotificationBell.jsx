'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, MessageSquare, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupportNotifications } from '@/features/shared/hooks/useSupportNotifications';
import { useOrderHistoryStore } from '@/features/orders/store/useOrderHistoryStore';
import { useSupportChatStore } from '@/features/support/store/useSupportChatStore';

export function SupportNotificationBell({ className, buttonClassName }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const {
    unreadCount,
    unreadTicketCount,
    unreadOrderCount,
    unreadTickets,
    unreadOrders,
    markAllRead,
    markAllOrderUpdatesRead,
  } = useSupportNotifications();
  const openChat = useSupportChatStore((state) => state.openChat);
  const openOrderHistory = useOrderHistoryStore((state) => state.openOrderHistory);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handlePointerDown);
    }

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showDropdown]);

  const handleOpenSupport = useCallback(() => {
    markAllRead();
    setShowDropdown(false);
    openChat();
  }, [markAllRead, openChat]);

  const handleOpenOrders = useCallback(() => {
    markAllOrderUpdatesRead();
    setShowDropdown(false);
    openOrderHistory();
  }, [markAllOrderUpdatesRead, openOrderHistory]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setShowDropdown((open) => !open)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-magenta dark:border-borderColor dark:bg-[#1a1025] dark:text-slate-300 dark:shadow-none',
          showDropdown && 'border-magenta/40 text-magenta',
          buttonClassName,
        )}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
            : 'Notifications'
        }
        aria-expanded={showDropdown}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#1a1025]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/5 dark:bg-[#150d22] dark:shadow-2xl">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-magenta">Notifications</p>
          </div>

          {unreadCount === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No new notifications.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {unreadOrderCount > 0 && (
                <button
                  type="button"
                  onClick={handleOpenOrders}
                  className="flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet">
                    <Package className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Order status update
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {unreadOrderCount === 1
                        ? '1 order updated — tap to view'
                        : `${unreadOrderCount} orders updated — tap to view`}
                    </span>
                    {unreadOrders[0] && (
                      <span className="mt-2 block text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {unreadOrders[0].id} is now {unreadOrders[0].status}
                      </span>
                    )}
                  </span>
                </button>
              )}

              {unreadTicketCount > 0 && (
                <button
                  type="button"
                  onClick={handleOpenSupport}
                  className="flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta/15 text-magenta">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      New message from Support
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {unreadTicketCount === 1
                        ? '1 unread reply — tap to open chat'
                        : `${unreadTicketCount} unread replies — tap to open chat`}
                    </span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
