'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useGuestAccess } from '@/features/auth/hooks/useGuestAccess';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';

export default function WishlistPage() {
  const router = useRouter();
  const { ready, isGuest } = useGuestAccess();
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const closeCart = useCartStore((state) => state.closeCart);

  useEffect(() => {
    if (!ready) return;
    if (isGuest) {
      router.replace('/login/face');
      return;
    }
    closeCart();
    openWishlist();
    router.replace('/dashboard');
  }, [ready, isGuest, router, openWishlist, closeCart]);

  return (
    <div className="midnight-shell flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-magenta" aria-label="Loading" />
    </div>
  );
}
