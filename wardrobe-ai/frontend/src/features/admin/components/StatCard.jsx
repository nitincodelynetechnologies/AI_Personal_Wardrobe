'use client';

import {
  Activity,
  CheckCircle2,
  DollarSign,
  Droplets,
  MessageCircle,
  Package,
  PackageX,
  Percent,
  ScanFace,
  ScanLine,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STAT_CARD_THEMES = {
  revenue: {
    icon: DollarSign,
    iconClass: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    ring: 'ring-emerald-500/25',
  },
  users: {
    icon: Users,
    iconClass: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    ring: 'ring-blue-500/25',
  },
  'face-accuracy': {
    icon: ScanFace,
    iconClass: 'text-violet',
    iconBg: 'bg-violet/15',
    ring: 'ring-violet/25',
  },
  conversion: {
    icon: Percent,
    iconClass: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
    ring: 'ring-orange-500/25',
  },
  'ai-tryons': {
    icon: Sparkles,
    iconClass: 'text-magenta',
    iconBg: 'bg-magenta/15',
    ring: 'ring-magenta/25',
  },
  'total-orders': {
    icon: Package,
    iconClass: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    ring: 'ring-cyan-500/25',
  },
  'registered-users': {
    icon: Users,
    iconClass: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    ring: 'ring-blue-500/25',
  },
  'total-registered': {
    icon: UserPlus,
    iconClass: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    ring: 'ring-blue-500/25',
  },
  'face-enrolled': {
    icon: ScanFace,
    iconClass: 'text-magenta',
    iconBg: 'bg-magenta/15',
    ring: 'ring-magenta/25',
  },
  'onboarding-complete': {
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    ring: 'ring-emerald-500/25',
  },
  churn: {
    icon: UserMinus,
    iconClass: 'text-rose-400',
    iconBg: 'bg-rose-500/15',
    ring: 'ring-rose-500/25',
  },
  'live-skus': {
    icon: Package,
    iconClass: 'text-violet',
    iconBg: 'bg-violet/15',
    ring: 'ring-violet/25',
  },
  'out-of-stock': {
    icon: PackageX,
    iconClass: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
    ring: 'ring-orange-500/25',
  },
  'avg-margin': {
    icon: Percent,
    iconClass: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    ring: 'ring-emerald-500/25',
  },
  'tryon-ctr': {
    icon: ScanLine,
    iconClass: 'text-magenta',
    iconBg: 'bg-magenta/15',
    ring: 'ring-magenta/25',
  },
  'chat-sessions': {
    icon: MessageCircle,
    iconClass: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    ring: 'ring-blue-500/25',
  },
  'tryon-renders': {
    icon: Sparkles,
    iconClass: 'text-magenta',
    iconBg: 'bg-magenta/15',
    ring: 'ring-magenta/25',
  },
  'outfit-gen': {
    icon: Wand2,
    iconClass: 'text-violet',
    iconBg: 'bg-violet/15',
    ring: 'ring-violet/25',
  },
  'inference-latency': {
    icon: Timer,
    iconClass: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
    ring: 'ring-orange-500/25',
  },
  'style-match': {
    icon: Sparkles,
    iconClass: 'text-magenta',
    iconBg: 'bg-magenta/15',
    ring: 'ring-magenta/25',
  },
  'color-harmony': {
    icon: Droplets,
    iconClass: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    ring: 'ring-emerald-500/25',
  },
  'lifestyle-fit': {
    icon: Activity,
    iconClass: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
    ring: 'ring-orange-500/25',
  },
};

const DEFAULT_THEME = {
  icon: TrendingUp,
  iconClass: 'text-violet',
  iconBg: 'bg-violet/15',
  ring: 'ring-violet/25',
};

function resolveTheme(id) {
  return STAT_CARD_THEMES[id] ?? DEFAULT_THEME;
}

export function StatCard({
  id,
  label,
  value,
  trend,
  trendUp = true,
  caption,
  className,
  onClick,
  isActive = false,
  activeRingClass,
  children,
}) {
  const theme = resolveTheme(id);
  const Icon = theme.icon;
  const isInteractive = Boolean(onClick);

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'admin-card group transition-all duration-200',
        isInteractive && 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(233,30,140,0.12)]',
        !isInteractive && 'hover:shadow-[0_0_32px_rgba(233,30,140,0.12)]',
        isActive && cn('ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#150d22]', activeRingClass),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <div
          className={cn(
            'rounded-lg p-2 ring-1 transition-transform duration-300 group-hover:scale-105',
            theme.iconBg,
            theme.ring,
          )}
        >
          <Icon className={cn('h-5 w-5', theme.iconClass)} aria-hidden />
        </div>
      </div>

      <p className="mt-4 font-sans text-4xl font-extrabold tracking-tight text-gray-900 tabular-nums dark:text-gray-100">
        {value}
      </p>

      {(trend || caption) && (
        <div className="mt-4 flex items-center justify-between gap-2">
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold',
                trendUp
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-rose-500/15 text-rose-400',
              )}
            >
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend}
            </span>
          ) : (
            <span />
          )}
          {caption && <span className="text-xs text-gray-500 dark:text-gray-400">{caption}</span>}
        </div>
      )}

      {children}
    </div>
  );
}
