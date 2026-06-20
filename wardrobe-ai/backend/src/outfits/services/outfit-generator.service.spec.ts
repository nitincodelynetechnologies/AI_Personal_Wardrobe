import { Test, TestingModule } from '@nestjs/testing';
import { ClothingItemRecord } from '../../wardrobe/interfaces/clothing-item.interface';
import { OutfitGeneratorService } from './outfit-generator.service';

describe('OutfitGeneratorService', () => {
  let service: OutfitGeneratorService;

  const baseItem = (
    id: string,
    category: string,
    color_hex: string | null = null,
    season = 'All',
  ): ClothingItemRecord => ({
    id,
    user_id: 'user-1',
    image_url: `/uploads/wardrobe/user-1/${id}.jpg`,
    category,
    sub_category: null,
    color_hex,
    season,
    is_favorite: false,
    created_at: new Date(),
    updated_at: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutfitGeneratorService],
    }).compile();

    service = module.get(OutfitGeneratorService);
  });

  it('detects missing required wardrobe categories', () => {
    expect(service.hasRequiredCategories([baseItem('top-1', 'Top')])).toBe(false);
    expect(
      service.hasRequiredCategories([
        baseItem('top-1', 'Top'),
        baseItem('bottom-1', 'Bottom'),
        baseItem('shoe-1', 'Footwear'),
      ]),
    ).toBe(true);
  });

  it('generates a selection with score between 70 and 99', () => {
    const selection = service.generateSelection([
      baseItem('top-1', 'Top', '#111111'),
      baseItem('bottom-1', 'Bottom', '#222222'),
      baseItem('shoe-1', 'Footwear', '#333333'),
    ]);

    expect(selection.top_id).toBeTruthy();
    expect(selection.bottom_id).toBeTruthy();
    expect(selection.footwear_id).toBeTruthy();
    expect(selection.style_score).toBeGreaterThanOrEqual(70);
    expect(selection.style_score).toBeLessThanOrEqual(99);
  });

  it('prefers season-compatible items when season is provided', () => {
    const selection = service.generateSelection(
      [
        baseItem('top-summer', 'Top', null, 'Summer'),
        baseItem('top-all', 'Top', null, 'All'),
        baseItem('bottom-summer', 'Bottom', null, 'Summer'),
        baseItem('bottom-all', 'Bottom', null, 'All'),
        baseItem('shoe-summer', 'Footwear', null, 'Summer'),
        baseItem('shoe-all', 'Footwear', null, 'All'),
      ],
      'Summer',
    );

    expect(['top-summer', 'top-all']).toContain(selection.top_id);
    expect(['bottom-summer', 'bottom-all']).toContain(selection.bottom_id);
    expect(['shoe-summer', 'shoe-all']).toContain(selection.footwear_id);
    expect(selection.season_tag).toBe('Summer');
  });
});
