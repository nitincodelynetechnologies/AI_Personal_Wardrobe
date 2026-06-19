import { calculateMockFashionDna } from './fashion-dna.mock';

describe('calculateMockFashionDna', () => {
  it('derives scores and affinity maps from preferences', () => {
    const result = calculateMockFashionDna({
      favorite_colors: ['navy', 'beige'],
      favorite_brands: ['Zara'],
      budget_range: 'premium',
      fashion_style: 'minimalist',
    });

    expect(result.style_score).toBeGreaterThan(0);
    expect(result.lifestyle_score).toBe(90);
    expect(result.color_affinity.navy).toBeDefined();
    expect(result.brand_affinity.Zara).toBeDefined();
  });
});
