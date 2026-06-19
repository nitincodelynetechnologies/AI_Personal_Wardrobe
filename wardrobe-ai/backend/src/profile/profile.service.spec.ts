import { Test, TestingModule } from '@nestjs/testing';
import { FashionDnaService } from '../fashion-dna/fashion-dna.service';
import { PostgresService } from '../database/postgres.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let fashionDnaService: { recalculateFromPreferences: jest.Mock };

  const mockPostgresService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    fashionDnaService = {
      recalculateFromPreferences: jest.fn().mockResolvedValue({
        id: 'dna-1',
        style_score: '78',
        lifestyle_score: '55',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PostgresService, useValue: mockPostgresService },
        { provide: FashionDnaService, useValue: fashionDnaService },
      ],
    }).compile();

    service = module.get(ProfileService);
    mockPostgresService.query.mockReset();
  });

  describe('mergePreferences', () => {
    it('merges dto values over existing preferences', () => {
      const merged = service.mergePreferences(
        {
          id: 'pref-1',
          user_id: 'user-1',
          favorite_colors: ['black'],
          favorite_brands: ['Zara'],
          budget_range: 'low',
          fashion_style: 'casual',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          favorite_colors: ['navy', 'beige'],
          budget_range: 'mid',
        },
      );

      expect(merged.favorite_colors).toEqual(['navy', 'beige']);
      expect(merged.favorite_brands).toEqual(['Zara']);
      expect(merged.budget_range).toBe('mid');
      expect(merged.fashion_style).toBe('casual');
    });

    it('defaults to empty arrays when no existing record', () => {
      const merged = service.mergePreferences(null, { fashion_style: 'minimalist' });

      expect(merged.favorite_colors).toEqual([]);
      expect(merged.favorite_brands).toEqual([]);
      expect(merged.fashion_style).toBe('minimalist');
    });
  });

  describe('updatePreferences', () => {
    it('persists preferences and triggers Fashion DNA recalculation', async () => {
      mockPostgresService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'pref-1',
              user_id: 'user-1',
              favorite_colors: ['navy'],
              favorite_brands: ['H&M'],
              budget_range: 'mid',
              fashion_style: 'minimalist',
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        });

      const result = await service.updatePreferences('user-1', {
        favorite_colors: ['navy'],
        favorite_brands: ['H&M'],
        budget_range: 'mid',
        fashion_style: 'minimalist',
      });

      expect(mockPostgresService.query).toHaveBeenCalledTimes(2);
      expect(fashionDnaService.recalculateFromPreferences).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          favorite_colors: ['navy'],
          fashion_style: 'minimalist',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.fashion_dna.id).toBe('dna-1');
    });
  });
});
