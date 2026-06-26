import { Module } from '@nestjs/common';
import { VtonController } from './vton.controller';
import { VtonService } from './vton.service';

@Module({
  controllers: [VtonController],
  providers: [VtonService],
  exports: [VtonService],
})
export class VtonModule {}
