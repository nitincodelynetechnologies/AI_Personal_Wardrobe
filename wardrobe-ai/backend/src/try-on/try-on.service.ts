import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { TRY_ON_DELAY_MS } from './constants/try-on.constants';
import { TryOnRequestDto } from './dto/try-on.dto';

@Injectable()
export class TryOnService {
  private readonly logger = new Logger(TryOnService.name);

  constructor(private readonly productsService: ProductsService) {}

  async generateTryOn(dto: TryOnRequestDto) {
    this.logger.log(
      `Virtual try-on started for user=${dto.user_id} product=${dto.product_id}`,
    );

    const product = await this.resolveProduct(dto.product_id);

    await this.delay(TRY_ON_DELAY_MS);

    this.logger.log(
      `Virtual try-on completed for user=${dto.user_id} product=${dto.product_id}`,
    );

    return {
      success: true,
      product_id: dto.product_id,
      user_id: dto.user_id,
      image_url: product?.ai_render_image ?? product?.image_url ?? '',
      processing_ms: TRY_ON_DELAY_MS,
    };
  }

  private async resolveProduct(productId: string) {
    const products = await this.productsService.findAll();
    return products.find((product) => product.id === productId);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
