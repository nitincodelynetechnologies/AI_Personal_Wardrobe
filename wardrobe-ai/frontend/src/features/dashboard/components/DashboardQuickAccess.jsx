'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DASHBOARD_QUICK_ACCESS } from '@/features/dashboard/constants/dashboardQuickAccess';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { requestOpenStylistChat } from '@/features/stylist-chat/utils/stylistChatUi';

const QUICK_ACCESS_CARD_CLASS =
  'group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-white/5 dark:bg-[#150d22] dark:shadow-[0_0_24px_rgba(0,0,0,0.25)] dark:hover:border-white/10';

function QuickAccessCardContent({ item }) {
  const Icon = item.icon;

  return (
    <>
      <span
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
          item.iconWrapperClass,
        )}
      >
        <Icon className={cn('h-5 w-5', item.iconClass)} aria-hidden />
      </span>
      <div className="min-w-0 px-1">
        <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
          {item.label}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
      </div>
    </>
  );
}

export function DashboardQuickAccess({ className }) {
  const router = useRouter();
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const closeCart = useCartStore((state) => state.closeCart);

  const handleCardAction = (item) => {
    if (item.action === 'wishlist') {
      closeCart();
      openWishlist();
      return;
    }

    if (item.action === 'stylist') {
      requestOpenStylistChat();
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <section className={cn('space-y-5', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">
            Command Hub
          </p>
          <h2 className="mt-1 font-playfair text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Quick Access
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {DASHBOARD_QUICK_ACCESS.map((item) => {
          if (item.action) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCardAction(item)}
                className={QUICK_ACCESS_CARD_CLASS}
              >
                <QuickAccessCardContent item={item} />
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={QUICK_ACCESS_CARD_CLASS}>
              <QuickAccessCardContent item={item} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
