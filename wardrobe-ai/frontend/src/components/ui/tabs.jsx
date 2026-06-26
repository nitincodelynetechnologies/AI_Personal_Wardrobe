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
        'inline-flex h-11 w-full items-center rounded-lg border border-borderColor bg-white dark:bg-[#150d22] p-1 sm:w-auto',
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
        'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white',
        'data-[state=active]:bg-magenta/15 data-[state=active]:text-magenta',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('space-y-4', className)} {...props} />;
}
