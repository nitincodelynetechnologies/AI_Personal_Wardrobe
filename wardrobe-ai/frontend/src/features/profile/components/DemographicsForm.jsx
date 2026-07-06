'use client';

import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  BODY_TYPE_OPTIONS,
  cmToFeetInches,
  feetInchesToCm,
  GENDER_OPTIONS,
  kgToLbs,
  lbsToKg,
  SKIN_TONE_OPTIONS,
} from '@/features/profile/constants/onboardingOptions';

function SelectionCard({ label, selected, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all duration-300 ease-in-out',
        'hover:scale-105 hover:border-magenta/40 hover:shadow-md',
        selected
          ? 'scale-[1.02] border-magenta bg-magenta/10 text-magenta ring-2 ring-magenta/30 shadow-[0_8px_24px_rgba(233,30,140,0.15)] dark:bg-magenta/15'
          : 'border-borderColor bg-white text-slate-600 dark:border-white/10 dark:bg-[#150d22] dark:text-slate-300',
        className,
      )}
    >
      {label}
    </button>
  );
}

function SelectionCardGrid({ options, value, onChange, columns = 'grid-cols-2 sm:grid-cols-4' }) {
  return (
    <div className={cn('grid gap-3', columns)}>
      {options.map((option) => (
        <SelectionCard
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

export function DemographicsForm({ data, errors, onChange, step = 1 }) {
  const { feet, inches } = cmToFeetInches(data.heightCm || 170);

  const updateHeightFromImperial = (nextFeet, nextInches) => {
    onChange({ heightCm: feetInchesToCm(nextFeet, nextInches) });
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            type="text"
            autoComplete="name"
            value={data.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Jane Doe"
            className="transition-all duration-300 focus:ring-2 focus:ring-magenta/20"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-3">
          <Label>Gender</Label>
          <SelectionCardGrid
            options={GENDER_OPTIONS}
            value={data.gender}
            onChange={(value) => onChange({ gender: value })}
            columns="grid-cols-2"
          />
          {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={13}
              max={120}
              inputMode="numeric"
              value={data.age}
              onChange={(event) => onChange({ age: event.target.value })}
              placeholder="28"
              className="transition-all duration-300 focus:ring-2 focus:ring-magenta/20"
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="height-cm">Height (cm)</Label>
            <Input
              id="height-cm"
              type="number"
              min={50}
              max={250}
              inputMode="decimal"
              value={data.heightCm}
              onChange={(event) => onChange({ heightCm: event.target.value })}
              placeholder="170"
              className="transition-all duration-300 focus:ring-2 focus:ring-magenta/20"
            />
            {errors.heightCm && <p className="text-xs text-destructive">{errors.heightCm}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Height (ft / in)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={3}
                max={8}
                value={feet}
                onChange={(event) =>
                  updateHeightFromImperial(Number(event.target.value), inches)
                }
                aria-label="Feet"
                className="transition-all duration-300 focus:ring-2 focus:ring-magenta/20"
              />
              <Input
                type="number"
                min={0}
                max={11}
                value={inches}
                onChange={(event) => updateHeightFromImperial(feet, Number(event.target.value))}
                aria-label="Inches"
                className="transition-all duration-300 focus:ring-2 focus:ring-magenta/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight-kg">Weight (kg)</Label>
            <Input
              id="weight-kg"
              type="number"
              min={20}
              max={300}
              value={data.weightKg}
              onChange={(event) => onChange({ weightKg: event.target.value })}
              placeholder="65"
              className="transition-all duration-300 focus:ring-2 focus:ring-magenta/20"
            />
            {errors.weightKg && <p className="text-xs text-destructive">{errors.weightKg}</p>}
            <p className="text-xs text-muted-foreground">≈ {kgToLbs(data.weightKg || 0)} lbs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <Label>Body type</Label>
          <p className="mt-1 text-xs text-muted-foreground">Optional — helps us tailor fit recommendations.</p>
        </div>
        <SelectionCardGrid
          options={BODY_TYPE_OPTIONS}
          value={data.bodyType}
          onChange={(value) => onChange({ bodyType: value })}
          columns="grid-cols-2 sm:grid-cols-3"
        />
        {errors.bodyType && <p className="text-xs text-destructive">{errors.bodyType}</p>}
      </div>

      <div className="space-y-3">
        <div>
          <Label>Skin tone</Label>
          <p className="mt-1 text-xs text-muted-foreground">Optional — improves color matching for outfits.</p>
        </div>
        <SelectionCardGrid
          options={SKIN_TONE_OPTIONS}
          value={data.skinTone}
          onChange={(value) => onChange({ skinTone: value })}
          columns="grid-cols-2 sm:grid-cols-3"
        />
        {errors.skinTone && <p className="text-xs text-destructive">{errors.skinTone}</p>}
      </div>
    </div>
  );
}
