import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FashionDnaResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiPropertyOptional({ example: 78.5 })
  style_score: number | null;

  @ApiProperty({
    example: { navy: 0.82, beige: 0.74 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  color_affinity: Record<string, number>;

  @ApiProperty({
    example: { Zara: 0.71 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  brand_affinity: Record<string, number>;

  @ApiPropertyOptional({ example: 65.0 })
  lifestyle_score: number | null;

  @ApiPropertyOptional({ example: 'minimalist' })
  fashion_style: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
