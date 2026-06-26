'use client';

import { StatCard } from '@/features/admin/components/StatCard';

function MetricGrid({ stats }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.id ?? stat.label}
          {...stat}
          className={`animate-fade-in-view stagger-${(index % 4) + 1}`}
        />
      ))}
    </div>
  );
}

export function AdminSectionPanel({ title, description, stats, children }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
      </div>

      {stats && <MetricGrid stats={stats} />}
      {children}
    </div>
  );
}
