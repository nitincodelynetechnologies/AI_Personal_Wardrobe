'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { useWardrobe } from '@/features/wardrobe/hooks/useWardrobe';
import { WardrobeFilters } from '@/features/wardrobe/components/WardrobeFilters';
import { WardrobeGrid } from '@/features/wardrobe/components/WardrobeGrid';
import { WardrobeGridSkeleton } from '@/features/wardrobe/components/WardrobeGridSkeleton';
import { WardrobeEmptyState } from '@/features/wardrobe/components/WardrobeEmptyState';
import { UploadItemModal } from '@/features/wardrobe/components/UploadItemModal';
import { useWardrobeStore, getFilteredItems } from '@/features/wardrobe/store/useWardrobeStore';

export function WardrobePage() {
  const items = useWardrobeStore((state) => state.items);
  const categoryFilter = useWardrobeStore((state) => state.categoryFilter);

  const { ready } = useOnboardingGuard();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { isLoading, isError, error } = useWardrobe();

  if (!ready) return null;

  const filteredItems = getFilteredItems(items, categoryFilter);
  const showEmpty = !isLoading && filteredItems.length === 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet">Phase 3</p>
            <h1 className="font-playfair text-2xl font-semibold sm:text-3xl">My Wardrobe</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} item{items.length === 1 ? '' : 's'} in your digital closet
            </p>
          </div>
          <Button className="gap-2 self-start sm:self-auto" onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>

        <WardrobeFilters />

        {isError && (
          <Alert variant="destructive" role="alert">
            {getNetworkErrorMessage(error)}
          </Alert>
        )}

        {isLoading && items.length === 0 ? (
          <WardrobeGridSkeleton />
        ) : showEmpty ? (
          <WardrobeEmptyState
            onAddClick={() => setUploadOpen(true)}
            hasFilter={categoryFilter !== 'All' && items.length > 0}
          />
        ) : (
          <WardrobeGrid items={items} categoryFilter={categoryFilter} />
        )}
      </div>

      <UploadItemModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </DashboardLayout>
  );
}

export default WardrobePage;
