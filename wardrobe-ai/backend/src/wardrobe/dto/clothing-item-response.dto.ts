import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClothingItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  user_id: string;

  @ApiProperty({ example: '/uploads/wardrobe/user-id/item-id.jpg' })
  image_url: string;

  @ApiProperty({ example: 'Top' })
  category: string;

  @ApiPropertyOptional({ example: 'T-Shirt', nullable: true })
  sub_category: string | null;

  @ApiPropertyOptional({ example: '#1A2B3C', nullable: true })
  color_hex: string | null;

  @ApiProperty({ example: 'All' })
  season: string;

  @ApiProperty({ example: false })
  is_favorite: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class WardrobeItemsResponseDto {
  @ApiProperty({ type: [ClothingItemDto] })
  items: ClothingItemDto[];
}
