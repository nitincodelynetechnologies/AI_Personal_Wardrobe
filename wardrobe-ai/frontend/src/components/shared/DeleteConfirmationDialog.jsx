'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title = 'Delete item?',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  isDeleting = false,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onConfirm?.()}
          >
            {isDeleting ? 'Deleting...' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
