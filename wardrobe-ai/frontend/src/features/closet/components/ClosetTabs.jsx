'use client';

import { cn } from '@/lib/utils';
import { CLOSET_TABS } from '@/features/closet/constants/closetMockData';

export function ClosetTabs({ activeTab, onTabChange, tabs = CLOSET_TABS }) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTab),
  );
  const indicatorWidth = 100 / tabs.length;

  return (
    <div className="relative rounded-xl border border-borderColor bg-white/50 dark:bg-[#150d22]/50">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 px-6 py-3.5 text-sm font-semibold tracking-wide transition-colors',
              activeTab === tab.id
                ? 'text-magenta'
                : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="absolute bottom-0 h-0.5 rounded-full bg-magenta transition-all duration-300 ease-out"
        style={{
          width: `${indicatorWidth}%`,
          left: `${activeIndex * indicatorWidth}%`,
        }}
      />
    </div>
  );
}
