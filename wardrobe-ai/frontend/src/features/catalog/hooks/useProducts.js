'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts } from '@/features/catalog/services/catalogService';
import { GLOBAL_CATALOG_KEY, GLOBAL_CATALOG_UPDATED_EVENT } from '@/features/catalog/utils/globalCatalogStorage';

export function useProducts(category = 'All') {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === GLOBAL_CATALOG_KEY) invalidate();
    };

    window.addEventListener(GLOBAL_CATALOG_UPDATED_EVENT, invalidate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(GLOBAL_CATALOG_UPDATED_EVENT, invalidate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['products', category],
    queryFn: () => fetchProducts(null, { category }),
  });
}
