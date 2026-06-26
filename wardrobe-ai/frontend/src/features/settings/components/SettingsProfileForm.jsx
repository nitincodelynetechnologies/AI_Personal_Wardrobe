'use client';

import { Input, Label } from '@/components/ui/input';
import { GENDER_OPTIONS } from '@/features/profile/constants/onboardingOptions';

export function SettingsProfileForm({ data, errors, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="settings-gender">Gender</Label>
        <select
          id="settings-gender"
          value={data.gender}
          onChange={(event) => onChange({ gender: event.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select gender</option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-age">Age</Label>
        <Input
          id="settings-age"
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
        <Label htmlFor="settings-height">Height (cm)</Label>
        <Input
          id="settings-height"
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

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="settings-weight">Weight (kg)</Label>
        <Input
          id="settings-weight"
          type="number"
          min={20}
          max={300}
          inputMode="decimal"
          value={data.weightKg}
          onChange={(event) => onChange({ weightKg: event.target.value })}
          placeholder="65"
        />
        {errors.weightKg && <p className="text-xs text-destructive">{errors.weightKg}</p>}
      </div>
    </div>
  );
}
