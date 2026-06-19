import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import wardrobeConfig from './config/wardrobe.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { FashionDnaModule } from './fashion-dna/fashion-dna.module';
import { WardrobeModule } from './wardrobe/wardrobe.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '.env'),
      ],
      load: [databaseConfig, authConfig, wardrobeConfig],
    }),
    DatabaseModule,
    AuthModule,
    ProfileModule,
    FashionDnaModule,
    WardrobeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
