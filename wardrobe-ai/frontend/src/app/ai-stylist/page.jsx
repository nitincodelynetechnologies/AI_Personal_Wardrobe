'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useGuestAccess } from '@/features/auth/hooks/useGuestAccess';
import { queueOpenStylistChatAfterNavigation } from '@/features/stylist-chat/utils/stylistChatUi';

export default function AiStylistPage() {
  const router = useRouter();
  const { ready, isGuest } = useGuestAccess();

  useEffect(() => {
    if (!ready) return;
    if (isGuest) {
      router.replace('/login/face');
      return;
    }
    queueOpenStylistChatAfterNavigation();
    router.replace('/dashboard');
  }, [ready, isGuest, router]);

  return (
    <div className="midnight-shell flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-magenta" aria-label="Loading" />
    </div>
  );
}
