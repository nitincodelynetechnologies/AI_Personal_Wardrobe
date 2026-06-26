'use client';

import { cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-magenta text-white hover:bg-magenta/80 hover:shadow-[0_0_20px_rgba(233,30,140,0.5)]',
        secondary:
          'border border-borderColor bg-white text-slate-900 hover:bg-slate-100 dark:bg-[#150d22] dark:text-white dark:hover:bg-[#1a1028]',
        outline:
          'border border-borderColor bg-transparent text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-[#150d22]/60',
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-[#150d22]/60 dark:hover:text-white',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
