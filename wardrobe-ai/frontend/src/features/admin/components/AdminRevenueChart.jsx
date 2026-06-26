'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminChartTooltip } from '@/features/admin/components/AdminChartTooltip';
import { MONTHLY_REVENUE_DATA } from '@/features/admin/constants/adminMockData';

const MAGENTA = '#e91e8c';
const AXIS_TICK = { fill: '#64748b', fontSize: 11, fontWeight: 500 };

function formatRevenue(value) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}K`;
}

export function AdminRevenueChart({ className }) {
  return (
    <div className={className}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
            Revenue Analytics
          </p>
          <h3 className="mt-1 font-playfair text-xl font-semibold text-white">
            Monthly Revenue Growth
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Trailing 12 months · INR · live mock feed
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={MAGENTA} stopOpacity={0.4} />
                <stop offset="55%" stopColor={MAGENTA} stopOpacity={0.1} />
                <stop offset="100%" stopColor={MAGENTA} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              tickFormatter={formatRevenue}
              width={52}
            />
            <Tooltip
              content={
                <AdminChartTooltip
                  valueFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                />
              }
              cursor={{ stroke: MAGENTA, strokeWidth: 1, strokeOpacity: 0.35, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={MAGENTA}
              strokeWidth={3}
              fill="url(#adminRevenueGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: MAGENTA,
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
