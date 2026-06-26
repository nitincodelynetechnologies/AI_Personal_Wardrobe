import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsListResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List curated catalog products' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['Men', 'Women', 'Footwear', 'Accessories'],
  })
  @ApiResponse({ status: 200, type: ProductsListResponseDto })
  async listProducts(@Query('category') category?: string) {
    const products = await this.productsService.findAll(category);

    return {
      products: (products ?? []).map((product) => ({
        id: product.id,
        sku: product.sku,
        brand: product.brand,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        image_url: product.image_url,
        ai_render_image: product.ai_render_image ?? product.image_url,
        glb_url: product.glb_url,
        has_sleeves: product.has_sleeves,
        style_tags: product.style_tags ?? [],
      })),
    };
  }
}
