import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import {
  AdminSupportReplyDto,
  SaveSupportBotReplyDto,
  SendSupportMessageDto,
} from './dto/support-chat.dto';
import { SupportChatService } from './support-chat.service';

@ApiTags('support')
@Controller('support')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a customer support message' })
  async sendMessage(@CurrentUser() user: PublicUser, @Body() dto: SendSupportMessageDto) {
    this.supportChatService.ensureReady();
    return this.supportChatService.sendUserMessage(user, dto.text, dto.name);
  }

  @Post('messages/bot-reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Persist an AI bot reply for a support ticket' })
  async saveBotReply(@CurrentUser() user: PublicUser, @Body() dto: SaveSupportBotReplyDto) {
    this.supportChatService.ensureReady();
    return this.supportChatService.saveBotReply(user, dto.ticketId, dto.text);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List support tickets for the signed-in user' })
  async listMyTickets(@CurrentUser() user: PublicUser) {
    this.supportChatService.ensureReady();
    const tickets = await this.supportChatService.listTicketsForUser(user);
    return { tickets };
  }
}

@ApiTags('support-admin')
@ApiBearerAuth()
@Controller('support/admin')
export class SupportAdminController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Get('tickets')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'List all support tickets (admin only)' })
  async listTickets() {
    this.supportChatService.ensureReady();
    const tickets = await this.supportChatService.listTicketsForAdmin();
    return { tickets };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Unread support ticket count (admin only)' })
  async unreadCount() {
    this.supportChatService.ensureReady();
    const count = await this.supportChatService.getUnreadCountForAdmin();
    return { count };
  }

  @Post('tickets/:id/replies')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Send an admin reply to a support ticket' })
  async reply(@Param('id') id: string, @Body() dto: AdminSupportReplyDto) {
    this.supportChatService.ensureReady();
    const ticket = await this.supportChatService.sendAdminReply(id, dto.text);
    return { success: true, ticket };
  }

  @Patch('tickets/:id/read')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Mark a support ticket as read by admin' })
  async markRead(@Param('id') id: string) {
    this.supportChatService.ensureReady();
    await this.supportChatService.markAdminTicketRead(id);
    return { success: true };
  }
}
