import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PostgresService } from '../database/postgres.service';
import { QdrantService } from '../database/qdrant.service';
import { ClothingAiService } from './services/clothing-ai.service';
import { WardrobeService } from './wardrobe.service';

describe('WardrobeService', () => {
  let service: WardrobeService;

  const mockPostgresService = {
    assertReady: jest.fn(),
    query: jest.fn(),
  };

  const mockQdrantService = {
    assertReady: jest.fn(),
    upsertClothingItemVector: jest.fn(),
  };

  const mockClothingAiService = {
    generateEmbedding: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'wardrobe.uploadDir') return '/tmp/wardrobe-uploads';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WardrobeService,
        { provide: PostgresService, useValue: mockPostgresService },
        { provide: QdrantService, useValue: mockQdrantService },
        { provide: ClothingAiService, useValue: mockClothingAiService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(WardrobeService);
    jest.clearAllMocks();
  });

  it('throws when image file is missing', async () => {
    await expect(
      service.uploadClothing('user-1', undefined, { category: 'Top' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns wardrobe items for a user', async () => {
    const items = [
      {
        id: 'item-1',
        user_id: 'user-1',
        image_url: '/uploads/wardrobe/user-1/item-1.jpg',
        category: 'Top',
        sub_category: 'T-Shirt',
        color_hex: '#112233',
        season: 'All',
        is_favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockPostgresService.query.mockResolvedValue({ rows: items });

    await expect(service.getItemsByUserId('user-1')).resolves.toEqual(items);
    expect(mockPostgresService.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM wardrobe.clothing_items'),
      ['user-1'],
    );
  });
});
