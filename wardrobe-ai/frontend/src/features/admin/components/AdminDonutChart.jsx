'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import {
  AI_TRYON_DONUT_DATA,
  AI_TRYON_SUCCESS_RATE,
} from '@/features/admin/constants/adminMockData';

const TOOLTIP_STYLE = {
  backgroundColor: '#150d22',
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#fff',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
};

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];

  return (
    <div className="rounded-lg border border-white/10 bg-[#150d22] px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-white">{entry.name}</p>
      <p className="text-sm font-semibold text-magenta">{entry.value}%</p>
    </div>
  );
}

export function AdminDonutChart({ className }) {
  return (
    <div className={cn('relative', className)}>
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
          AI Performance
        </p>
        <h3 className="mt-1 font-playfair text-xl font-semibold text-white">
          Try-On Success Rate
        </h3>
        <p className="mt-1 text-sm text-slate-400">Session outcomes · last 30 days</p>
      </div>

      <div className="relative mx-auto h-[280px] w-full max-w-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={AI_TRYON_DONUT_DATA}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {AI_TRYON_DONUT_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-playfair text-5xl font-semibold tracking-tight text-white">
            {AI_TRYON_SUCCESS_RATE}%
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            Success
          </span>
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {AI_TRYON_DONUT_DATA.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="font-medium">{item.name}</span>
            <span className="font-semibold text-white">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
