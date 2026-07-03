import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminGuard } from '../admin/admin.guard';
import { SupportAdminController, SupportChatController } from './support-chat.controller';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatService } from './support-chat.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SupportChatController, SupportAdminController],
  providers: [SupportChatService, SupportChatGateway, AdminGuard],
  exports: [SupportChatService],
})
export class SupportChatModule {}
