import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class TryOnRequestDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsString()
  @MaxLength(64)
  product_id!: string;

  @ApiProperty({ example: 'uuid-user-id' })
  @IsUUID()
  user_id!: string;
}

export class TryOnResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'uuid-product-id' })
  product_id!: string;

  @ApiProperty({ example: 'uuid-user-id' })
  user_id!: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1509631179647-0177331693ae' })
  image_url!: string;

  @ApiProperty({ example: 5000 })
  processing_ms!: number;
}
