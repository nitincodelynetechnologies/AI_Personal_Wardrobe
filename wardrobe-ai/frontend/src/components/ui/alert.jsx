'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
};

export function Alert({ className, variant = 'default', children, ...props }) {
  const Icon = icons[variant] || icons.default;

  return (
    <div
      role="alert"
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg border p-4',
        variant === 'destructive' && 'border-destructive/50 bg-destructive/10 text-destructive',
        variant === 'success' && 'border-champagne/30 bg-champagne/10 text-champagne-light',
        variant === 'default' && 'border-border bg-muted/50',
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-sm">{children}</div>
    </div>
  );
}
