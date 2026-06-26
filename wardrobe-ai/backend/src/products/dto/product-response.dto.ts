import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'SKU-MEN-001' })
  sku!: string;

  @ApiProperty({ example: 'COS' })
  brand!: string;

  @ApiProperty({ example: 'Oversized Wool Coat' })
  name!: string;

  @ApiProperty({ example: 'Men', enum: ['Men', 'Women', 'Footwear', 'Accessories'] })
  category!: string;

  @ApiProperty({ example: 8999 })
  price!: number;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1594938291221-94f313b0e6ad' })
  image_url!: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1594938298598-708a05fce089?w=800&q=80',
    description: 'Pre-mapped VTON render — worn in a real-world setting',
  })
  ai_render_image!: string;

  @ApiPropertyOptional({
    example: '/models/shirt.glb',
    description: '3D garment model for virtual try-on',
  })
  glb_url?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'When true, try-on uses the armless avatar base mesh for sleeve fitting',
  })
  has_sleeves?: boolean;

  @ApiProperty({ example: ['minimalist', 'winter'] })
  style_tags!: string[];
}

export class ProductsListResponseDto {
  @ApiProperty({ type: [ProductDto] })
  products!: ProductDto[];
}

export class ListProductsQueryDto {
  @ApiPropertyOptional({ enum: ['Men', 'Women', 'Footwear', 'Accessories'] })
  category?: string;
}
