'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_SEGMENT_COLORS = ['#ec4899', '#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981'];

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-[#150d22]">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">{entry.name}</p>
      <p className="text-sm font-semibold" style={{ color: entry.payload.fill }}>
        {entry.value}%
      </p>
      {entry.payload.revenue != null && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ₹{Number(entry.payload.revenue).toLocaleString('en-IN')} revenue
        </p>
      )}
    </div>
  );
}

export function AdminCategorySalesChart({ data = [] }) {
  const hasData = data.length > 0 && data.some((item) => item.value > 0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#150d22]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-500">
        Category Split
      </p>
      <h3 className="mt-1 font-playfair text-xl font-semibold text-gray-900 dark:text-white">
        Sales by Category
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Live revenue split from <code className="text-pink-400">vton_orders</code>
      </p>

      {!hasData ? (
        <div className="mt-10 flex h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
          No category sales yet — orders will appear here automatically.
        </div>
      ) : (
        <>
          <div className="mx-auto mt-6 h-[220px] w-full max-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_SEGMENT_COLORS[index % CATEGORY_SEGMENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-6 space-y-4">
            {data.map((item, index) => (
              <li key={item.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="flex min-w-[88px] items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{
                      backgroundColor:
                        CATEGORY_SEGMENT_COLORS[index % CATEGORY_SEGMENT_COLORS.length],
                    }}
                    aria-hidden
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor:
                        CATEGORY_SEGMENT_COLORS[index % CATEGORY_SEGMENT_COLORS.length],
                    }}
                  />
                </div>
                <span className="min-w-[2.5rem] text-right text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
