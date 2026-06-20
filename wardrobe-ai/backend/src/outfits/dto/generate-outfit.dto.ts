import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { OUTFIT_SEASONS } from '../constants/outfits.constants';

export class GenerateOutfitDto {
  @ApiPropertyOptional({ example: 'All', enum: OUTFIT_SEASONS })
  @IsOptional()
  @IsIn([...OUTFIT_SEASONS])
  season?: string;

  @ApiPropertyOptional({ example: 'Weekend Casual', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
