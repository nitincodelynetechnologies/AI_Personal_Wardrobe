'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root className={cn('space-y-6', className)} {...props} />;
}

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-11 w-full items-center rounded-lg border border-white/10 bg-noir-elevated/40 p-1 sm:w-auto',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
        'text-muted-foreground hover:text-foreground',
        'data-[state=active]:bg-champagne/15 data-[state=active]:text-champagne',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('space-y-4', className)} {...props} />;
}
