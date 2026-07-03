import { z } from 'zod';

export const demographicsSchema = z.object({
  name: z
    .string()
    .max(255, 'Name is too long')
    .optional()
    .or(z.literal('')),
  gender: z.string().min(1, 'Select your gender'),
  age: z.coerce.number().int().min(13, 'Minimum age is 13').max(120, 'Maximum age is 120'),
  heightCm: z.coerce.number().min(50, 'Enter a valid height').max(250, 'Enter a valid height'),
  weightKg: z.coerce.number().min(20, 'Enter a valid weight').max(300, 'Enter a valid weight'),
  bodyType: z.string().min(1, 'Select your body type'),
  skinTone: z.string().min(1, 'Select your skin tone'),
});

export const preferencesSchema = z.object({
  favoriteColors: z.array(z.string()).min(1, 'Pick at least one color'),
  favoriteBrands: z.array(z.string()).min(1, 'Pick at least one brand'),
  budgetSlider: z.number().min(0).max(100),
  fashionStyle: z.string().min(1, 'Select your fashion style'),
});

export const onboardingSchema = demographicsSchema.merge(preferencesSchema);

export function validateDemographics(data) {
  return demographicsSchema.safeParse(data);
}

export function validatePreferences(data) {
  return preferencesSchema.safeParse(data);
}
