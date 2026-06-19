import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    example: ['navy', 'beige', 'black'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  favorite_colors?: string[];

  @ApiPropertyOptional({
    example: ['Zara', 'H&M'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  favorite_brands?: string[];

  @ApiPropertyOptional({ example: 'mid', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  budget_range?: string;

  @ApiPropertyOptional({ example: 'minimalist', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fashion_style?: string;
}
