'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Sparkles, TrendingUp, X } from 'lucide-react';
import { AdminActiveCouponBanner } from '@/features/admin/components/AdminActiveCouponBanner';
import { StatCard } from '@/features/admin/components/StatCard';
import { AdminChartTooltip } from '@/features/admin/components/AdminChartTooltip';
import { AdminCard } from '@/features/admin/components/AdminCard';
import { AdminRevenueChart } from '@/features/admin/components/AdminRevenueChart';
import { AdminRevenueVsTargetChart } from '@/features/admin/components/AdminRevenueVsTargetChart';
import { AdminCategorySalesChart } from '@/features/admin/components/AdminCategorySalesChart';
import {
  ADMIN_KPI_CHART_CONFIG,
  AI_TRYON_SUCCESS_RATE,
} from '@/features/admin/constants/adminMockData';
import { useAdminDashboardMetrics } from '@/features/admin/hooks/useAdminDashboardMetrics';
import { useActiveCoupon } from '@/features/admin/hooks/useActiveCoupon';
import { VTON_TODAY_STATS } from '@/features/admin/storage/adminCrmStorage';

const X_TICK = { fill: '#94a3b8', fontSize: 11 };

/** Admin dashboard mock — top 3 VTON trending SKUs today */
const VTON_TRENDING_ITEMS = [
  {
    id: 'trend-bomber',
    name: '3D Urban Bomber Jacket',
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80&auto=format&fit=crop',
    tryCount: 89,
    totalSessions: 247,
    cartConversion: 18,
    popularSize: 'M',
  },
  {
    id: 'trend-dress',
    name: 'Silk Evening Midi Dress',
    imageUrl:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80&auto=format&fit=crop',
    tryCount: 72,
    totalSessions: 198,
    cartConversion: 22,
    popularSize: 'S',
  },
  {
    id: 'trend-sneaker',
    name: 'Urban Runner Sneakers',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80&auto=format&fit=crop',
    tryCount: 64,
    totalSessions: 176,
    cartConversion: 15,
    popularSize: 'L',
  },
];

const CHART_INTERACTION_CLASS =
  'focus:outline-none focus:ring-0 [&_*]:outline-none [&_*]:focus:outline-none [&_.recharts-bar-rectangle]:outline-none [&_.recharts-active-bar]:outline-none';

const DAY_FULL_NAMES = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const METRIC_VALUE_LABELS = {
  revenue: 'Revenue',
  users: 'Active Users',
  accuracy: 'Face Login Accuracy',
  conversion: 'Conversion Rate',
  tryons: 'AI Try-on Sessions',
  orders: 'Orders',
};

function getDayInsight(metricKey, dayName, value) {
  const day = DAY_FULL_NAMES[dayName] ?? dayName;

  if (metricKey === 'revenue') {
    return `Peak sales hours detected between 6 PM - 9 PM on ${day}. Top performing category was Men's Outerwear with a 95% AI Try-on conversion rate.`;
  }

  if (metricKey === 'users') {
    return `${day} saw elevated mobile traffic with strong retention from returning shoppers and face-login users.`;
  }

  if (metricKey === 'tryons') {
    return `Virtual fitting room usage spiked on ${day} with ${Number(value).toLocaleString('en-IN')} sessions — bomber jackets led try-on volume.`;
  }

  if (metricKey === 'orders') {
    return `${day} checkout velocity improved versus the prior week, driven by weekend-ready outfits and express shipping upsells.`;
  }

  return `Performance on ${day} remained healthy across catalog browse, AI styling, and checkout funnel stages.`;
}

function ChartInsightPopover({ selectedData, metricKey, activeConfig, onClose }) {
  if (!selectedData || !activeConfig) return null;

  const dayLabel = DAY_FULL_NAMES[selectedData.name] ?? selectedData.name;
  const valueLabel = METRIC_VALUE_LABELS[metricKey] ?? 'Metric';
  const formattedValue = activeConfig.valueFormatter(selectedData.value);

  return (
    <div
      className="absolute right-0 top-0 z-20 w-full max-w-md rounded-xl border border-magenta/25 bg-white p-4 shadow-lg ring-0 dark:border-magenta/30 dark:bg-[#150d22] sm:right-2"
      role="dialog"
      aria-label={`Detailed insights for ${dayLabel}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
            Business Breakdown
          </p>
          <h4 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
            Detailed Insights for {dayLabel}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-0 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Close insights"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums dark:text-gray-100">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{valueLabel}: </span>
        {formattedValue}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {getDayInsight(metricKey, selectedData.name, selectedData.value)}
      </p>
    </div>
  );
}

function TrendingItemDetailModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trending-item-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal backdrop"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-magenta/20 bg-white shadow-2xl dark:border-magenta/30 dark:bg-[#150d22]">
        <div className="relative h-56 bg-gray-100 dark:bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
              AI Try-on Analytics
            </p>
            <h3
              id="trending-item-modal-title"
              className="mt-1 text-xl font-semibold text-gray-900 dark:text-white"
            >
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {item.tryCount} try-ons today · IDM-VTON & 3D fitting room
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-black/20">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total AI Sessions
              </dt>
              <dd className="mt-1 font-sans text-2xl font-extrabold tabular-nums text-gray-900 dark:text-gray-100">
                {item.totalSessions.toLocaleString('en-IN')}
              </dd>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-black/20">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Add to Cart Conversion
              </dt>
              <dd className="mt-1 font-sans text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                {item.cartConversion}%
              </dd>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-black/20">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Most Popular Size Tried
              </dt>
              <dd className="mt-1 font-sans text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                {item.popularSize}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-magenta px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { kpis, graphData, monthlyRevenueData, categorySalesData, revenueVsTargetData } =
    useAdminDashboardMetrics();
  const { activeCoupon } = useActiveCoupon();
  const [activeMetric, setActiveMetric] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedTrendingItem, setSelectedTrendingItem] = useState(null);

  useEffect(() => {
    setSelectedData(null);
  }, [activeMetric]);

  const handleCardClick = (metricKey) => {
    setActiveMetric((prev) => (prev === metricKey ? null : metricKey));
  };

  const handleBarClick = (barEntry) => {
    const point = barEntry?.payload ?? barEntry;
    if (point?.name != null) {
      setSelectedData(point);
    }
  };

  const activeConfig = activeMetric ? ADMIN_KPI_CHART_CONFIG[activeMetric] : null;
  const activeData = activeMetric ? graphData[activeMetric] : null;
  const barFill = activeConfig?.barFill ?? activeConfig?.stroke ?? '#e91e8c';

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">Analytics</p>
        <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">
          Advanced Analytics Dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Click any KPI mini-card to reveal a detailed trend chart below. Click a bar for a business breakdown.
        </p>
      </section>

      <AdminActiveCouponBanner coupon={activeCoupon} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card, index) => {
          const isOpen = activeMetric === card.metricKey;
          const chartConfig = ADMIN_KPI_CHART_CONFIG[card.metricKey];

          return (
            <StatCard
              key={card.id}
              {...card}
              onClick={() => handleCardClick(card.metricKey)}
              isActive={isOpen}
              activeRingClass={chartConfig?.ring}
              className={`animate-fade-in-view stagger-${(index % 4) + 1}`}
            />
          );
        })}
      </section>

      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          activeMetric ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {activeMetric && activeConfig && activeData && (
          <AdminCard className="border-magenta/20">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {activeConfig.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeConfig.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedData(null);
                  setActiveMetric(null);
                }}
                className="text-xs font-semibold uppercase tracking-wider text-magenta hover:underline focus:outline-none focus:ring-0"
              >
                Close chart
              </button>
            </div>

            <div className={`relative h-80 ${CHART_INTERACTION_CLASS}`}>
              {selectedData && (
                <ChartInsightPopover
                  selectedData={selectedData}
                  metricKey={activeMetric}
                  activeConfig={activeConfig}
                  onClose={() => setSelectedData(null)}
                />
              )}

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={X_TICK} />
                  <YAxis axisLine={false} tickLine={false} tick={X_TICK} width={48} />
                  <Tooltip
                    content={
                      <AdminChartTooltip valueFormatter={activeConfig.valueFormatter} />
                    }
                    cursor={{ fill: 'rgba(233,30,140,0.08)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill={barFill}
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    cursor="pointer"
                    style={{ outline: 'none' }}
                    activeBar={{
                      fill: barFill,
                      stroke: 'none',
                      strokeWidth: 0,
                      opacity: 0.85,
                    }}
                    onClick={handleBarClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminRevenueVsTargetChart data={revenueVsTargetData} />
        <AdminCategorySalesChart data={categorySalesData} />
      </div>

      <AdminCard className="border-magenta/20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-[240px]">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-magenta" aria-hidden />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                AI Try-on Stats — Today
              </h3>
            </div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {VTON_TODAY_STATS.sessionsToday.toLocaleString('en-IN')}
              <span className="ml-2 text-base font-normal text-slate-500">sessions</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-500">
              <TrendingUp className="h-4 w-4" />
              {VTON_TODAY_STATS.successRate}% success rate · IDM-VTON & 3D fitting room
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Platform avg accuracy: {AI_TRYON_SUCCESS_RATE}% (7-day rolling)
            </p>
          </div>

          <div className="flex min-w-[320px] flex-1 flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-magenta">
              Top Trending Items
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {VTON_TRENDING_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTrendingItem(item)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-magenta/20 bg-white text-left shadow-sm transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-0 dark:border-magenta/30 dark:bg-[#0f0818]/80"
                >
                  <div className="relative h-28 overflow-hidden bg-gray-100 dark:bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs font-medium text-magenta">
                      {item.tryCount.toLocaleString('en-IN')} try-ons today
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AdminCard>

      <TrendingItemDetailModal
        item={selectedTrendingItem}
        onClose={() => setSelectedTrendingItem(null)}
      />

      <AdminCard>
        <AdminRevenueChart data={monthlyRevenueData} />
      </AdminCard>
    </div>
  );
}
