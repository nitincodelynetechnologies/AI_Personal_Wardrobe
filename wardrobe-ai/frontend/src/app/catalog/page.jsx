import { Suspense } from 'react';
import { CatalogPage } from '@/features/catalog/components/CatalogPage';

export default function CatalogRoutePage() {
  return (
    <Suspense fallback={null}>
      <CatalogPage />
    </Suspense>
  );
}
