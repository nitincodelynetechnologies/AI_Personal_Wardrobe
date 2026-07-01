'use client';

import { Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderHistoryPanel } from '@/features/settings/components/OrderHistoryPanel';
import { useOrderHistoryStore } from '@/features/orders/store/useOrderHistoryStore';

export function OrderHistoryModal() {
  const isOpen = useOrderHistoryStore((state) => state.isOpen);
  const closeOrderHistory = useOrderHistoryStore((state) => state.closeOrderHistory);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeOrderHistory()}>
      <DialogContent className="max-h-[min(90vh,820px)] max-w-2xl overflow-hidden border-borderColor bg-white p-0 dark:border-white/10 dark:bg-[#150d22]">
        <DialogHeader className="border-b border-borderColor px-6 py-5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-magenta/15 text-magenta">
              <Package className="h-5 w-5" aria-hidden />
            </span>
            <div className="text-left">
              <DialogTitle className="font-playfair text-xl">My Orders</DialogTitle>
              <DialogDescription className="text-sm">
                Track status updates and download invoices for your purchases.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(min(90vh,820px)-6.5rem)] overflow-y-auto px-6 py-5">
          <OrderHistoryPanel markReadOnMount />
        </div>
      </DialogContent>
    </Dialog>
  );
}
