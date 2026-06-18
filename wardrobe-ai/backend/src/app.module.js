const { Module } = require('@nestjs/common');
const { join } = require('path');
const { ConfigModule } = require('@nestjs/config');
const databaseConfig = require('./config/database.config');
const authConfig = require('./config/auth.config');
const { DatabaseModule } = require('./database/database.module');
const { AuthModule } = require('./auth/auth.module');
const { HealthController } = require('./health/health.controller');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '.env'),
      ],
      load: [databaseConfig, authConfig],
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
class AppModule {}

module.exports = { AppModule };
