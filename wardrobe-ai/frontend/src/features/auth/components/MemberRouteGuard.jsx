'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useGuestAccess } from '@/features/auth/hooks/useGuestAccess';

/**
 * Blocks guests from member-only shells; redirects to face login.
 */
export function MemberRouteGuard({ children }) {
  const router = useRouter();
  const { ready, isGuest } = useGuestAccess();

  useEffect(() => {
    if (ready && isGuest) {
      router.replace('/login/face');
    }
  }, [ready, isGuest, router]);

  if (!ready || isGuest) {
    return (
      <div className="midnight-shell flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-magenta" aria-label="Loading" />
      </div>
    );
  }

  return children;
}
