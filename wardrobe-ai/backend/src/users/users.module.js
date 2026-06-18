const { Module } = require('@nestjs/common');
const { DatabaseModule } = require('../database/database.module');
const { UsersService } = require('./users.service');

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  exports: [UsersService],
})
class UsersModule {}

module.exports = { UsersModule };
