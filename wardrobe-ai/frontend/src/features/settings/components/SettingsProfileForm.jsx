'use client';

import { Input, Label } from '@/components/ui/input';

export function SettingsProfileForm({ data, errors, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
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

      <div className="space-y-2">
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
