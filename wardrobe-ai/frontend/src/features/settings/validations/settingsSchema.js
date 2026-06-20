import { z } from 'zod';

export const settingsProfileSchema = z.object({
  age: z.coerce.number().int().min(13, 'Minimum age is 13').max(120, 'Maximum age is 120'),
  heightCm: z.coerce.number().min(50, 'Enter a valid height').max(250, 'Enter a valid height'),
  weightKg: z.coerce.number().min(20, 'Enter a valid weight').max(300, 'Enter a valid weight'),
});

export const settingsPreferencesSchema = z.object({
  favoriteColors: z.array(z.string()).min(1, 'Pick at least one color'),
  budgetSlider: z.number().min(0).max(100),
});

export function validateSettingsProfile(data) {
  return settingsProfileSchema.safeParse(data);
}

export function validateSettingsPreferences(data) {
  return settingsPreferencesSchema.safeParse(data);
}
