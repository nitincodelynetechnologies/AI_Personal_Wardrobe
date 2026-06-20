import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClothingItemDto } from '../../wardrobe/dto/clothing-item-response.dto';

export class OutfitDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @ApiPropertyOptional({ nullable: true })
  top_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  bottom_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  footwear_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  accessory_id: string | null;

  @ApiProperty({ example: 87 })
  style_score: number;

  @ApiProperty({ example: 'All' })
  season_tag: string;

  @ApiProperty({ example: false })
  is_favorite: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional({ type: ClothingItemDto, nullable: true })
  top: ClothingItemDto | null;

  @ApiPropertyOptional({ type: ClothingItemDto, nullable: true })
  bottom: ClothingItemDto | null;

  @ApiPropertyOptional({ type: ClothingItemDto, nullable: true })
  footwear: ClothingItemDto | null;

  @ApiPropertyOptional({ type: ClothingItemDto, nullable: true })
  accessory: ClothingItemDto | null;
}

export class OutfitsListResponseDto {
  @ApiProperty({ type: [OutfitDto] })
  outfits: OutfitDto[];
}

export class GenerateOutfitResponseDto {
  @ApiProperty({ type: OutfitDto })
  outfit: OutfitDto;
}
