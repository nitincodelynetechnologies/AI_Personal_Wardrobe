import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CLOTHING_CATEGORIES,
  CLOTHING_SEASONS,
} from '../constants/wardrobe.constants';

export class UploadClothingDto {
  @ApiProperty({ example: 'Top', enum: CLOTHING_CATEGORIES })
  @IsString()
  @IsIn(CLOTHING_CATEGORIES)
  category: string;

  @ApiPropertyOptional({ example: 'T-Shirt', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sub_category?: string;

  @ApiPropertyOptional({ example: '#1A2B3C' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color_hex must be a valid #RRGGBB hex code' })
  color_hex?: string;

  @ApiPropertyOptional({ example: 'All', enum: CLOTHING_SEASONS, default: 'All' })
  @IsOptional()
  @IsString()
  @IsIn(CLOTHING_SEASONS)
  season?: string;
}
