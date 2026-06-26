'use client';

import { useCallback, useEffect, useState } from 'react';
import { readSavedLooks, SAVED_LOOKS_UPDATED_EVENT } from '@/features/face-studio/utils/bodyScanStorage';

export function useSavedLooks(userId) {
  const [savedLooks, setSavedLooks] = useState([]);

  const refresh = useCallback(() => {
    setSavedLooks(readSavedLooks(userId));
  }, [userId]);

  useEffect(() => {
    refresh();

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === 'wardrobe_saved_looks' ||
        event.key.startsWith('wardrobe_saved_looks:') ||
        event.key.startsWith('savedLooks')
      ) {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SAVED_LOOKS_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SAVED_LOOKS_UPDATED_EVENT, refresh);
    };
  }, [refresh]);

  return savedLooks;
}
