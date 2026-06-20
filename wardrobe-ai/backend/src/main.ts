import 'reflect-metadata';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.setGlobalPrefix('api');

  const corsOrigins = (process.env.CORS_ORIGINS ||
    'http://localhost:3000,http://localhost:3002,http://localhost:3003,http://127.0.0.1:3000,http://127.0.0.1:3002,http://127.0.0.1:3003')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Personal Wardrobe API')
    .setDescription('Phase 1 — Face Auth | Phase 2 — Profile & Fashion DNA | Phase 3 — Digital Wardrobe | Phase 4 — AI Outfits | Phase 5 — AI Stylist Service')
    .setVersion('5.0')    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.API_PORT || '3001', 10);
  await app.listen(port);

  console.log(`Wardrobe API: http://localhost:${port}/api`);
  console.log(`Swagger UI:  http://localhost:${port}/api/docs`);
}

bootstrap();
