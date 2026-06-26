'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { AdminChartTooltip } from '@/features/admin/components/AdminChartTooltip';
import {
  ADMIN_KPI_CHART_CONFIG,
  ADMIN_KPI_GRAPH_DATA,
} from '@/features/admin/constants/adminMockData';

const X_AXIS_TICK = { fill: '#94a3b8', fontSize: 11 };

export function AdminKpiMiniChart({ metricKey }) {
  const config = ADMIN_KPI_CHART_CONFIG[metricKey];
  const data = ADMIN_KPI_GRAPH_DATA[metricKey];

  if (!config || !data) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={X_AXIS_TICK} dy={4} />
        <Tooltip
          content={
            <AdminChartTooltip valuePrefix="" valueFormatter={config.valueFormatter} />
          }
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar
          dataKey="value"
          fill={config.barFill ?? config.stroke}
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
