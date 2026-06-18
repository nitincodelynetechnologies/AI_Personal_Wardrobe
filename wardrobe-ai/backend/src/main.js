require('reflect-metadata');
const { ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const { AppModule } = require('./app.module');
const { DatabaseExceptionFilter } = require('./common/filters/database-exception.filter');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
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
    .setDescription('Phase 1 — Face Authentication & User Management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.API_PORT || '3001', 10);
  await app.listen(port);

  console.log(`Wardrobe API: http://localhost:${port}/api`);
  console.log(`Swagger UI:  http://localhost:${port}/api/docs`);
}

bootstrap();
