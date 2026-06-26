import { BadRequestException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { PostgresService } from '../database/postgres.service';

import { FashionDnaService } from '../fashion-dna/fashion-dna.service';

import { WardrobeService } from '../wardrobe/wardrobe.service';

import { OutfitsService } from './outfits.service';

import { StylistService } from './services/stylist.service';



describe('OutfitsService', () => {

  let service: OutfitsService;



  const mockPostgresService = {

    assertReady: jest.fn(),

    query: jest.fn(),

  };



  const mockWardrobeService = {

    getItemsByUserId: jest.fn(),

  };



  const mockStylistService = {

    recommendOutfit: jest.fn(),

  };



  const mockFashionDnaService = {

    getByUserId: jest.fn(),

  };



  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({

      providers: [

        OutfitsService,

        { provide: PostgresService, useValue: mockPostgresService },

        { provide: WardrobeService, useValue: mockWardrobeService },

        { provide: StylistService, useValue: mockStylistService },

        { provide: FashionDnaService, useValue: mockFashionDnaService },

      ],

    }).compile();



    service = module.get(OutfitsService);

    jest.clearAllMocks();

    mockFashionDnaService.getByUserId.mockRejectedValue(new Error('not found'));

  });



  it('throws when wardrobe lacks required categories', async () => {

    mockWardrobeService.getItemsByUserId.mockResolvedValue([

      {

        id: 'top-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/top.jpg',

        category: 'Top',

        sub_category: null,

        color_hex: '#111111',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

    ]);



    await expect(service.generateOutfit('user-1', {})).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.generateOutfit('user-1', {})).rejects.toThrow(

      'Not enough items in wardrobe to generate an outfit.',

    );

  });



  it('generates and returns a populated outfit from stylist service', async () => {

    const wardrobeItems = [

      {

        id: 'top-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/top.jpg',

        category: 'Top',

        sub_category: 'T-Shirt',

        color_hex: '#111111',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

      {

        id: 'bottom-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/bottom.jpg',

        category: 'Bottom',

        sub_category: 'Jeans',

        color_hex: '#222222',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

      {

        id: 'footwear-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/shoes.jpg',

        category: 'Footwear',

        sub_category: 'Sneakers',

        color_hex: '#333333',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

    ];



    mockWardrobeService.getItemsByUserId.mockResolvedValue(wardrobeItems);

    mockStylistService.recommendOutfit.mockResolvedValue({

      top_id: 'top-1',

      bottom_id: 'bottom-1',

      footwear_id: 'footwear-1',

      accessory_id: null,

      style_score: 88,

      season_tag: 'All',

    });



    mockPostgresService.query

      .mockResolvedValueOnce({

        rows: [],

      })

      .mockResolvedValueOnce({

        rows: [

          {

            id: 'outfit-1',

            user_id: 'user-1',

            name: null,

            top_id: 'top-1',

            bottom_id: 'bottom-1',

            footwear_id: 'footwear-1',

            accessory_id: null,

            style_score: 88,

            season_tag: 'All',

            is_favorite: false,

            created_at: new Date(),

            updated_at: new Date(),

          },

        ],

      })

      .mockResolvedValueOnce({

        rows: [

          {

            id: 'outfit-1',

            user_id: 'user-1',

            name: null,

            top_id: 'top-1',

            bottom_id: 'bottom-1',

            footwear_id: 'footwear-1',

            accessory_id: null,

            style_score: 88,

            season_tag: 'All',

            is_favorite: false,

            created_at: new Date(),

            updated_at: new Date(),

            top: wardrobeItems[0],

            bottom: wardrobeItems[1],

            footwear: wardrobeItems[2],

            accessory: null,

          },

        ],

      });



    const outfit = await service.generateOutfit('user-1', { season: 'All' });



    expect(mockStylistService.recommendOutfit).toHaveBeenCalledWith(

      wardrobeItems,

      'All',

      null,

      [],

    );

    expect(outfit.id).toBe('outfit-1');

    expect(outfit.top?.image_url).toBe('/uploads/wardrobe/user-1/top.jpg');

    expect(outfit.style_score).toBe(88);

  });



  it('returns outfits with nested clothing items', async () => {

    mockPostgresService.query.mockResolvedValue({

      rows: [

        {

          id: 'outfit-1',

          user_id: 'user-1',

          name: 'Casual',

          top_id: 'top-1',

          bottom_id: 'bottom-1',

          footwear_id: 'footwear-1',

          accessory_id: null,

          style_score: 91,

          season_tag: 'All',

          is_favorite: false,

          created_at: new Date(),

          updated_at: new Date(),

          top: {

            id: 'top-1',

            user_id: 'user-1',

            image_url: '/uploads/wardrobe/user-1/top.jpg',

            category: 'Top',

            sub_category: null,

            color_hex: null,

            season: 'All',

            is_favorite: false,

            created_at: new Date(),

            updated_at: new Date(),

          },

          bottom: null,

          footwear: null,

          accessory: null,

        },

      ],

    });



    const outfits = await service.getOutfitsByUserId('user-1');



    expect(outfits).toHaveLength(1);

    expect(outfits[0].top?.category).toBe('Top');

    expect(mockPostgresService.query).toHaveBeenCalledWith(

      expect.stringContaining('FROM wardrobe.outfits'),

      ['user-1'],

    );

  });



  it('updates outfit feedback and returns populated outfit', async () => {

    const wardrobeItems = [

      {

        id: 'top-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/top.jpg',

        category: 'Top',

        sub_category: null,

        color_hex: '#111111',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

      {

        id: 'bottom-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/bottom.jpg',

        category: 'Bottom',

        sub_category: null,

        color_hex: '#222222',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

      {

        id: 'footwear-1',

        user_id: 'user-1',

        image_url: '/uploads/wardrobe/user-1/shoes.jpg',

        category: 'Footwear',

        sub_category: null,

        color_hex: '#333333',

        season: 'All',

        is_favorite: false,

        created_at: new Date(),

        updated_at: new Date(),

      },

    ];



    mockPostgresService.query

      .mockResolvedValueOnce({ rows: [{ id: 'outfit-1' }] })

      .mockResolvedValueOnce({

        rows: [

          {

            id: 'outfit-1',

            user_id: 'user-1',

            name: null,

            top_id: 'top-1',

            bottom_id: 'bottom-1',

            footwear_id: 'footwear-1',

            accessory_id: null,

            style_score: 88,

            season_tag: 'All',

            is_favorite: true,

            created_at: new Date(),

            updated_at: new Date(),

            top: wardrobeItems[0],

            bottom: wardrobeItems[1],

            footwear: wardrobeItems[2],

            accessory: null,

          },

        ],

      });



    const outfit = await service.updateOutfitFeedback('user-1', 'outfit-1', true);



    expect(outfit.is_favorite).toBe(true);

    expect(outfit.top?.category).toBe('Top');

  });



  it('deletes an outfit for the authenticated user', async () => {

    mockPostgresService.query.mockResolvedValueOnce({ rows: [{ id: 'outfit-1' }] });



    await expect(service.deleteOutfit('user-1', 'outfit-1')).resolves.toEqual({ success: true });

  });

});


