'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/features/admin/components/StatCard';
import {
  COLOR_HEX_MAP,
  formatLabel,
  getTopAffinities,
} from '@/features/dashboard/utils/dashboardUtils';
import { ClosetRadialScore } from '@/features/closet/components/ClosetRadialScore';
import {
  CLOSET_COLOR_SWATCHES,
  MOCK_BODY_TRAITS,
  MOCK_STYLE_TAGS,
} from '@/features/closet/constants/closetMockData';

function TraitBadge({ label, value }) {
  return (
    <div className="glass-hud px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export function ClosetFashionDnaPanel({ fashionDna, profile, preferences, usingMock = false }) {
  const styleScore = fashionDna?.style_score ?? 85;
  const styleMatch = fashionDna?.style_match ?? 88;
  const colorHarmony = fashionDna?.color_harmony ?? 91;
  const lifestyleScore = fashionDna?.lifestyle_score ?? 76;

  const closetStats = [
    {
      id: 'style-match',
      label: 'Style Match',
      value: `${styleMatch}%`,
      trend: '+4%',
      trendUp: true,
      caption: 'vs last month',
    },
    {
      id: 'color-harmony',
      label: 'Color Harmony',
      value: `${colorHarmony}%`,
      trend: '+2%',
      trendUp: true,
      caption: 'palette alignment',
    },
    {
      id: 'lifestyle-fit',
      label: 'Lifestyle Fit',
      value: `${lifestyleScore}%`,
      trend: '+1%',
      trendUp: true,
      caption: 'wardrobe behavior',
    },
  ];

  const colorAffinities = getTopAffinities(fashionDna?.color_affinity, 4);
  const swatches =
    colorAffinities.length > 0
      ? colorAffinities.map((item) => ({
          name: item.name,
          hex: COLOR_HEX_MAP[item.name] || '#888',
        }))
      : CLOSET_COLOR_SWATCHES;

  const bodyType = formatLabel(profile?.body_type) || MOCK_BODY_TRAITS.bodyType;
  const skinTone = formatLabel(profile?.skin_tone) || MOCK_BODY_TRAITS.skinTone;
  const faceShape = MOCK_BODY_TRAITS.faceShape;
  const styleTags = preferences?.fashion_style
    ? [formatLabel(preferences.fashion_style), ...MOCK_STYLE_TAGS.slice(1)]
    : MOCK_STYLE_TAGS;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="glass-hud animate-fade-in-view flex flex-col gap-6 p-8 lg:col-span-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-slate-900 dark:text-white">
            Your Style Intelligence
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-700 dark:text-gray-400">
            AI-analyzed profile combining body geometry, color theory, and wardrobe behavior.
          </p>
          {usingMock && (
            <p className="mt-3 text-xs text-magenta">Preview data — complete onboarding for live DNA.</p>
          )}
        </div>
        <ClosetRadialScore
          value={styleScore}
          label="Fashion Confidence"
          sublabel="Style score"
          size={184}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1">
        {closetStats.map((stat, index) => (
          <StatCard
            key={stat.id}
            {...stat}
            className={`animate-fade-in-view stagger-${index + 1}`}
          />
        ))}
      </section>

      <section className="glass-hud animate-fade-in-view stagger-1 p-6 lg:col-span-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <h3 className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">Body & Face Analysis</h3>
        </div>
        <div className="mt-5 grid gap-3">
          <TraitBadge label="Body Type" value={bodyType} />
          <TraitBadge label="Skin Tone" value={skinTone} />
          <TraitBadge label="Face Shape" value={faceShape} />
        </div>
      </section>

      <section className="glass-hud animate-fade-in-view stagger-2 p-6 lg:col-span-4">
        <h3 className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">Color Affinity</h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">Palette optimized for your undertone.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 sm:justify-start">
          {swatches.map((color) => (
            <div
              key={color.name}
              className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:-translate-y-1"
            >
              <span
                className={cn(
                  'h-12 w-12 rounded-full border-2 border-borderColor shadow-md ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-lg',
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-400">
                {color.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-hud animate-fade-in-view stagger-3 p-6 lg:col-span-4">
        <h3 className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">Style Tags</h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">Dominant aesthetics in your closet.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {styleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-magenta/20 bg-magenta/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-magenta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
