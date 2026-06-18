const { Module } = require('@nestjs/common');
const { JwtModule } = require('@nestjs/jwt');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { DatabaseModule } = require('../database/database.module');
const { UsersModule } = require('../users/users.module');
const { AuthController } = require('./auth.controller');
const { AuthService } = require('./auth.service');
const { FaceService } = require('./services/face.service');

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config) => ({
        secret: config.get('auth.jwtSecret'),
        signOptions: {
          expiresIn: config.get('auth.jwtExpiresIn') ?? '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, FaceService],
  exports: [AuthService],
})
class AuthModule {}

module.exports = { AuthModule };
