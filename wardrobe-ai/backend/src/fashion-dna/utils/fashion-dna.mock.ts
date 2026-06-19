import { ConfigService } from '@nestjs/config';
import { UserPreferencesRecord } from '../../profile/interfaces/profile.interface';
import { MockFashionDnaResult } from '../interfaces/fashion-dna.interface';

const BUDGET_SCORES: Record<string, number> = {
  low: 35,
  mid: 55,
  medium: 55,
  high: 75,
  premium: 90,
};

export function calculateMockFashionDna(
  preferences: Pick<
    UserPreferencesRecord,
    'favorite_colors' | 'favorite_brands' | 'budget_range' | 'fashion_style'
  >,
): MockFashionDnaResult {
  const colors = preferences.favorite_colors ?? [];
  const brands = preferences.favorite_brands ?? [];
  const budgetKey = preferences.budget_range?.toLowerCase() ?? 'mid';

  const style_score = Math.min(
    100,
    Math.round(35 + colors.length * 8 + brands.length * 5 + (preferences.fashion_style ? 10 : 0)),
  );

  const lifestyle_score = BUDGET_SCORES[budgetKey] ?? 50;

  const color_affinity = Object.fromEntries(
    colors.map((color, index) => [color, Number((0.55 + index * 0.08).toFixed(2))]),
  );

  const brand_affinity = Object.fromEntries(
    brands.map((brand, index) => [brand, Number((0.5 + index * 0.1).toFixed(2))]),
  );

  return {
    style_score,
    lifestyle_score,
    color_affinity,
    brand_affinity,
  };
}

export function generateMockFashionVector(
  seed: string,
  configService: ConfigService,
): number[] {
  const size =
    configService.get<number>(
      'database.qdrant.vectorSizes.fashionDna',
    ) ?? 512;

  const vector = new Array<number>(size);
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let i = 0; i < size; i += 1) {
    hash = Math.imul(hash ^ (hash >>> 13), 2654435761);
    vector[i] = (hash / 0xffffffff) * 2 - 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}
