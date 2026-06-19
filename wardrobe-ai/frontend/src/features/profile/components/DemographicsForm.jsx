'use client';

import { Input, Label } from '@/components/ui/input';
import { ToggleGroup } from '@/components/ui/toggle-group';
import {
  BODY_TYPE_OPTIONS,
  cmToFeetInches,
  feetInchesToCm,
  GENDER_OPTIONS,
  kgToLbs,
  lbsToKg,
  SKIN_TONE_OPTIONS,
} from '@/features/profile/constants/onboardingOptions';

export function DemographicsForm({ data, errors, onChange }) {
  const { feet, inches } = cmToFeetInches(data.heightCm || 170);

  const updateHeightFromImperial = (nextFeet, nextInches) => {
    onChange({ heightCm: feetInchesToCm(nextFeet, nextInches) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Gender</Label>
        <ToggleGroup
          options={GENDER_OPTIONS}
          value={data.gender}
          onChange={(value) => onChange({ gender: value })}
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
          />
          {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
        </div>

        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input
            type="number"
            min={50}
            max={250}
            inputMode="decimal"
            value={data.heightCm}
            onChange={(event) => onChange({ heightCm: event.target.value })}
            placeholder="170"
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
            />
            <Input
              type="number"
              min={0}
              max={11}
              value={inches}
              onChange={(event) => updateHeightFromImperial(feet, Number(event.target.value))}
              aria-label="Inches"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input
            type="number"
            min={20}
            max={300}
            value={data.weightKg}
            onChange={(event) => onChange({ weightKg: event.target.value })}
            placeholder="65"
          />
          {errors.weightKg && <p className="text-xs text-destructive">{errors.weightKg}</p>}
          <p className="text-xs text-muted-foreground">≈ {kgToLbs(data.weightKg || 0)} lbs</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Body type</Label>
        <ToggleGroup
          options={BODY_TYPE_OPTIONS}
          value={data.bodyType}
          onChange={(value) => onChange({ bodyType: value })}
        />
        {errors.bodyType && <p className="text-xs text-destructive">{errors.bodyType}</p>}
      </div>

      <div className="space-y-2">
        <Label>Skin tone</Label>
        <ToggleGroup
          options={SKIN_TONE_OPTIONS}
          value={data.skinTone}
          onChange={(value) => onChange({ skinTone: value })}
        />
        {errors.skinTone && <p className="text-xs text-destructive">{errors.skinTone}</p>}
      </div>
    </div>
  );
}
