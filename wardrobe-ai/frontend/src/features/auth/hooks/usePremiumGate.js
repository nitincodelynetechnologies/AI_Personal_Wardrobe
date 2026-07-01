'use client';

import { useCallback, useState } from 'react';
import { PremiumAuthModal } from '@/features/auth/components/PremiumAuthModal';
import { hasVtonUserProfile } from '@/features/auth/utils/premiumAccess';

export function usePremiumGate() {
  const [modalOpen, setModalOpen] = useState(false);

  const gatePremium = useCallback((onAllowed) => {
    if (hasVtonUserProfile()) {
      onAllowed?.();
      return true;
    }
    setModalOpen(true);
    return false;
  }, []);

  const interceptPremium = useCallback((event, onAllowed) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    return gatePremium(onAllowed);
  }, [gatePremium]);

  const PremiumGateModal = useCallback(
    () => <PremiumAuthModal open={modalOpen} onOpenChange={setModalOpen} />,
    [modalOpen],
  );

  return {
    isGuest: !hasVtonUserProfile(),
    modalOpen,
    setModalOpen,
    gatePremium,
    interceptPremium,
    PremiumGateModal,
  };
}
