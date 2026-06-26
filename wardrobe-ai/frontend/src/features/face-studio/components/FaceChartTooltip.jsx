'use client';

export function FaceChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const value = entry?.value;
  const displayLabel =
    label ?? entry?.payload?.subject ?? entry?.payload?.tone ?? entry?.name ?? 'Match';

  return (
    <div className="pointer-events-none rounded-lg border border-white/10 bg-[#150d22] px-3 py-2 shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">{displayLabel}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-white">{value}%</p>
    </div>
  );
}
