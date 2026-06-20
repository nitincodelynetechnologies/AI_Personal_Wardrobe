import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FashionDnaModule } from '../fashion-dna/fashion-dna.module';
import { WardrobeModule } from '../wardrobe/wardrobe.module';
import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';
import { StylistService } from './services/stylist.service';

@Module({
  imports: [DatabaseModule, AuthModule, WardrobeModule, FashionDnaModule],
  controllers: [OutfitsController],
  providers: [OutfitsService, StylistService],
  exports: [OutfitsService],
})
export class OutfitsModule {}
