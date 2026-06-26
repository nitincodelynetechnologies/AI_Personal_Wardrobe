import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VtonGenerateResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/generated-fit.png',
    description: 'URL or data URL of the AI-generated try-on image',
  })
  result_image_url?: string;

  @ApiPropertyOptional({ example: false })
  mock?: boolean;

  @ApiPropertyOptional({ example: 'uuid-user-id' })
  user_id?: string;

  @ApiPropertyOptional({ example: 'GPU queue timeout' })
  error?: string;
}
