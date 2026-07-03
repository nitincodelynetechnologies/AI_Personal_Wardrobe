import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FashionDnaModule } from '../fashion-dna/fashion-dna.module';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [DatabaseModule, FashionDnaModule, UsersModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
