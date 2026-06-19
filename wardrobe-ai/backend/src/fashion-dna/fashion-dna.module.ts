import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FashionDnaController } from './fashion-dna.controller';
import { FashionDnaService } from './fashion-dna.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [FashionDnaController],
  providers: [FashionDnaService],
  exports: [FashionDnaService],
})
export class FashionDnaModule {}
