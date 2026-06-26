'use client';

import { useState } from 'react';
import { StatCard } from '@/features/admin/components/StatCard';
import { AdminCard } from '@/features/admin/components/AdminCard';
import { AdminKpiMiniChart } from '@/features/admin/components/AdminKpiMiniChart';
import { AdminRevenueChart } from '@/features/admin/components/AdminRevenueChart';
import { AdminDonutChart } from '@/features/admin/components/AdminDonutChart';
import { ProductMetricsPanel } from '@/features/admin/components/ProductMetricsPanel';
import { RecentOrdersTable } from '@/features/admin/components/RecentOrdersTable';
import {
  ADMIN_KPI_CARDS,
  ADMIN_KPI_CHART_CONFIG,
  ADMIN_KPI_METRIC_KEY,
  MOST_TRIED_PRODUCTS,
  RECENT_ORDERS,
} from '@/features/admin/constants/adminMockData';

export function AdminOverview({ onNavigate }) {
  const [activeMetric, setActiveMetric] = useState(null);

  const handleCardClick = (metricKey) => {
    setActiveMetric((prev) => (prev === metricKey ? null : metricKey));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        <h2 className="font-playfair text-3xl font-semibold text-white">Business Overview</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Live platform pulse — revenue, engagement, AI accuracy, and conversion at a glance.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ADMIN_KPI_CARDS.map((card, index) => {
          const metricKey = ADMIN_KPI_METRIC_KEY[card.id] ?? card.id;
          const chartConfig = ADMIN_KPI_CHART_CONFIG[metricKey];
          const isOpen = activeMetric === metricKey;

          return (
            <div key={card.id} className="flex flex-col gap-3">
              <StatCard
                {...card}
                onClick={() => handleCardClick(metricKey)}
                isActive={isOpen}
                activeRingClass={chartConfig?.ring}
                className={`animate-fade-in-view stagger-${index + 1}`}
              />

              {isOpen && (
                <div
                  className="h-40 animate-in fade-in-0 duration-300 rounded-xl border border-white/5 bg-[#150d22]/60 p-4"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  role="presentation"
                >
                  <AdminKpiMiniChart metricKey={metricKey} />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <AdminCard className="animate-fade-in-view stagger-3">
        <AdminRevenueChart />
      </AdminCard>

      <AdminCard className="animate-fade-in-view stagger-4">
        <AdminDonutChart />
      </AdminCard>

      <AdminCard className="animate-fade-in-view stagger-5">
        <ProductMetricsPanel
          subtitle="Virtual Try-On"
          title="Most Tried Products"
          products={MOST_TRIED_PRODUCTS}
          variant="ranked"
        />
      </AdminCard>

      <section className="animate-fade-in-view stagger-6">
        <RecentOrdersTable
          orders={RECENT_ORDERS}
          showViewAll
          onViewAll={() => onNavigate?.('orders')}
        />
      </section>
    </div>
  );
}
