'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PINK = '#ec4899';
const AXIS_TICK = { fill: '#94a3b8', fontSize: 11, fontWeight: 500 };

const EMPTY_MONTHLY_DATA = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((month) => ({ month, revenue: 0, target: 0 }));

function formatYAxis(value) {
  if (value === 0) return '₹0';
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value / 1000)}K`;
}

function buildYAxisTicks(maxValue) {
  if (maxValue <= 0) return [0];
  const step = Math.max(1000, Math.ceil(maxValue / 4 / 1000) * 1000);
  const top = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let value = 0; value <= top; value += step) {
    ticks.push(value);
  }
  return ticks.length > 1 ? ticks : [0, top || 1000];
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const revenue = payload.find((entry) => entry.dataKey === 'revenue');
  const target = payload.find((entry) => entry.dataKey === 'target');

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-[#150d22]">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
      {revenue && (
        <p className="text-sm font-semibold text-pink-500">
          Revenue: ₹{Number(revenue.value).toLocaleString('en-IN')}
        </p>
      )}
      {target && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Target: ₹{Number(target.value).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}

export function AdminRevenueVsTargetChart({ data = EMPTY_MONTHLY_DATA }) {
  const chartData = data.length ? data : EMPTY_MONTHLY_DATA;
  const maxValue = Math.max(...chartData.map((point) => Math.max(point.revenue, point.target)), 0);
  const yTicks = useMemo(() => buildYAxisTicks(maxValue), [maxValue]);
  const yDomain = [0, yTicks[yTicks.length - 1] ?? 0];
  const hasRevenue = chartData.some((point) => point.revenue > 0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#150d22]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-500">
        Revenue Analytics
      </p>
      <h3 className="mt-1 font-playfair text-xl font-semibold text-gray-900 dark:text-white">
        Monthly Revenue vs Target
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Trailing 12 months · INR · from <code className="text-pink-400">vton_orders</code>
      </p>

      {!hasRevenue ? (
        <div className="mt-6 flex h-[280px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
          No revenue recorded yet — chart will populate when orders are placed.
        </div>
      ) : (
        <div className="mt-6 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adminRevenueVsTargetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PINK} stopOpacity={0.45} />
                  <stop offset="55%" stopColor={PINK} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={PINK} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={8} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={AXIS_TICK}
                ticks={yTicks}
                tickFormatter={formatYAxis}
                width={52}
                domain={yDomain}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={PINK}
                strokeWidth={3}
                fill="url(#adminRevenueVsTargetGradient)"
                dot={false}
                activeDot={{ r: 5, fill: PINK, stroke: 'none' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
