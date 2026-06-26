import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ProductsModule } from '../products/products.module';
import { TryOnModule } from '../try-on/try-on.module';
import { ClothingAiService } from './services/clothing-ai.service';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';

@Module({
  imports: [DatabaseModule, AuthModule, ProductsModule, TryOnModule],
  controllers: [WardrobeController],
  providers: [WardrobeService, ClothingAiService],
  exports: [WardrobeService],
})
export class WardrobeModule {}
