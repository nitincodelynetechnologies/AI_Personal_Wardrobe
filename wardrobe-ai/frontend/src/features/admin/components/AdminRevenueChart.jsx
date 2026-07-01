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

const MAGENTA = '#e91e8c';
const AXIS_TICK = { fill: '#64748b', fontSize: 11, fontWeight: 500 };

const EMPTY_MONTHLY_DATA = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((month) => ({ month, revenue: 0, growth: 0 }));

function formatRevenue(value) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}K`;
}

export function AdminRevenueChart({ className, data = EMPTY_MONTHLY_DATA }) {
  const chartData = data.length ? data : EMPTY_MONTHLY_DATA;
  const hasRevenue = chartData.some((point) => point.revenue > 0);

  return (
    <div className={className}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
            Revenue Analytics
          </p>
          <h3 className="mt-1 font-playfair text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Revenue Growth
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Trailing 12 months · INR · live from vton_orders
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {!hasRevenue ? (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
          No monthly revenue yet — place an order to see growth here.
        </div>
      ) : (
      <div className={`h-[300px] w-full focus:outline-none focus:ring-0 [&_*]:outline-none [&_*]:focus:outline-none`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={MAGENTA} stopOpacity={0.4} />
                <stop offset="55%" stopColor={MAGENTA} stopOpacity={0.1} />
                <stop offset="100%" stopColor={MAGENTA} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.25)" />
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
                stroke: 'none',
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
