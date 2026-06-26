import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'AI Stylist chat (stub)' })
  @ApiResponse({ status: 201, type: ChatResponseDto })
  async chat(@Body() dto: ChatRequestDto) {
    return this.chatService.generateReply(dto);
  }
}
