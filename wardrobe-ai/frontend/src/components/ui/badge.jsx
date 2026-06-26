import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-violet/30 bg-violet/10 text-violet',
        secondary: 'border-borderColor bg-white dark:bg-[#150d22] text-slate-700 dark:text-gray-400',
        outline: 'border-borderColor text-slate-900 dark:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
