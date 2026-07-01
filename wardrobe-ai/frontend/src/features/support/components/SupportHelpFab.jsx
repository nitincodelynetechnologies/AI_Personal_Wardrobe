'use client';

import { usePathname } from 'next/navigation';
import { Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupportNotifications } from '@/features/shared/hooks/useSupportNotifications';
import { useSupportChatStore } from '@/features/support/store/useSupportChatStore';

const HIDDEN_PREFIXES = ['/admin', '/login', '/register', '/'];

export function SupportHelpFab() {
  const pathname = usePathname();
  const { unreadCount } = useSupportNotifications();
  const { isOpen, openChat } = useSupportChatStore();

  const isHidden =
    HIDDEN_PREFIXES.some((prefix) =>
      prefix === '/' ? pathname === '/' : pathname.startsWith(prefix),
    ) || pathname.startsWith('/auth');

  if (isHidden || isOpen) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      className={cn(
        'fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full',
        'bg-magenta text-white shadow-[0_8px_30px_rgba(233,30,140,0.45)] transition-transform hover:scale-105',
        'md:bottom-8 md:right-8',
      )}
      aria-label="Open support chat"
    >
      <Headphones className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#150d22]"
          aria-hidden
        />
      )}
    </button>
  );
}
