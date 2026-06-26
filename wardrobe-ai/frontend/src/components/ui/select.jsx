'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Select({ ...props }) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectGroup({ ...props }) {
  return <SelectPrimitive.Group {...props} />;
}

export function SelectValue({ ...props }) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-lg border border-borderColor bg-white dark:bg-[#150d22] px-3 py-2 text-sm text-slate-900 dark:text-white',
        'focus:outline-none focus:ring-2 focus:ring-violet/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, position = 'popper', ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          'z-50 overflow-hidden rounded-lg border border-borderColor bg-white dark:bg-[#150d22] shadow-xl',
          'data-[state=open]:animate-fade-up',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none',
        'focus:bg-violet/15 focus:text-violet data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-violet" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
