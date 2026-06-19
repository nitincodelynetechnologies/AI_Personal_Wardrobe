'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/input';
import { ToggleGroup, MultiToggleGroup } from '@/components/ui/toggle-group';
import { BudgetSlider } from '@/components/ui/slider';
import {
  BRAND_OPTIONS,
  COLOR_SWATCHES,
  FASHION_STYLE_OPTIONS,
} from '@/features/profile/constants/onboardingOptions';

export function PreferencesForm({ data, errors, onChange }) {
  const toggleColor = (colorValue) => {
    const current = data.favoriteColors || [];
    if (current.includes(colorValue)) {
      onChange({ favoriteColors: current.filter((item) => item !== colorValue) });
      return;
    }
    onChange({ favoriteColors: [...current, colorValue] });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Favorite colors</Label>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
          {COLOR_SWATCHES.map((color) => {
            const selected = data.favoriteColors?.includes(color.value);

            return (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleColor(color.value)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all',
                  selected && 'bg-champagne/10 ring-1 ring-champagne/50',
                )}
                aria-pressed={selected}
                aria-label={color.label}
              >
                <span
                  className={cn(
                    'h-10 w-10 rounded-full border-2 transition-transform group-hover:scale-105',
                    selected ? 'border-champagne' : 'border-white/20',
                  )}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[10px] text-muted-foreground">{color.label}</span>
              </button>
            );
          })}
        </div>
        {errors.favoriteColors && (
          <p className="text-xs text-destructive">{errors.favoriteColors}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Favorite brands</Label>
        <MultiToggleGroup
          options={BRAND_OPTIONS}
          values={data.favoriteBrands}
          onChange={(values) => onChange({ favoriteBrands: values })}
        />
        {errors.favoriteBrands && (
          <p className="text-xs text-destructive">{errors.favoriteBrands}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Budget range</Label>
        <BudgetSlider
          value={data.budgetSlider}
          onChange={(value) => onChange({ budgetSlider: value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Fashion style</Label>
        <ToggleGroup
          options={FASHION_STYLE_OPTIONS}
          value={data.fashionStyle}
          onChange={(value) => onChange({ fashionStyle: value })}
        />
        {errors.fashionStyle && (
          <p className="text-xs text-destructive">{errors.fashionStyle}</p>
        )}
      </div>
    </div>
  );
}
