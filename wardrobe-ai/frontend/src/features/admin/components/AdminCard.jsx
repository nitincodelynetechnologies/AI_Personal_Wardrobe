'use client';

import { cn } from '@/lib/utils';

export function AdminCard({ children, className }) {
  return <div className={cn('admin-card', className)}>{children}</div>;
}
