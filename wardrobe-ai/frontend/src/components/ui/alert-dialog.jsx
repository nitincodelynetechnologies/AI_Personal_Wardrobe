'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AlertDialog({ ...props }) {
  return <AlertDialogPrimitive.Root {...props} />;
}

export function AlertDialogTrigger({ ...props }) {
  return <AlertDialogPrimitive.Trigger {...props} />;
}

export function AlertDialogPortal({ ...props }) {
  return <AlertDialogPrimitive.Portal {...props} />;
}

export function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4',
          'rounded-xl border border-white/10 bg-noir-elevated p-6 shadow-2xl duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('space-y-2 text-left', className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Title
      className={cn('font-display text-lg font-semibold', className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, ...props }) {
  return <AlertDialogPrimitive.Action asChild><Button className={className} {...props} /></AlertDialogPrimitive.Action>;
}

export function AlertDialogCancel({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button variant="outline" className={className} {...props} />
    </AlertDialogPrimitive.Cancel>
  );
}
