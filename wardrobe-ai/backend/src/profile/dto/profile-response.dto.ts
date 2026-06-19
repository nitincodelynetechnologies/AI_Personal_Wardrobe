import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiPropertyOptional({ example: 'female' })
  gender: string | null;

  @ApiPropertyOptional({ example: 28 })
  age: number | null;

  @ApiPropertyOptional({ example: 165.5 })
  height: string | null;

  @ApiPropertyOptional({ example: 62.0 })
  weight: string | null;

  @ApiPropertyOptional({ example: 'athletic' })
  body_type: string | null;

  @ApiPropertyOptional({ example: 'medium' })
  skin_tone: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class UserPreferencesDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ type: [String], example: ['navy', 'beige'] })
  favorite_colors: string[];

  @ApiProperty({ type: [String], example: ['Zara'] })
  favorite_brands: string[];

  @ApiPropertyOptional({ example: 'mid' })
  budget_range: string | null;

  @ApiPropertyOptional({ example: 'minimalist' })
  fashion_style: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class CombinedProfileResponseDto {
  @ApiPropertyOptional({ type: UserProfileDto })
  profile: UserProfileDto | null;

  @ApiPropertyOptional({ type: UserPreferencesDto })
  preferences: UserPreferencesDto | null;
}

export class UpdatePreferencesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: UserPreferencesDto })
  preferences: UserPreferencesDto;

  @ApiProperty({ description: 'Recalculated Fashion DNA summary' })
  fashion_dna: {
    id: string;
    style_score: number | null;
    lifestyle_score: number | null;
    fashion_style: string | null;
  };
}
