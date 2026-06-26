import { Injectable, Logger } from '@nestjs/common';
import {
  CHAT_MAX_DELAY_MS,
  CHAT_MIN_DELAY_MS,
  CHAT_RESPONSES,
  ChatIntent,
} from './constants/chat.constants';
import { ChatRequestDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async generateReply(dto: ChatRequestDto) {
    const intent = this.detectIntent(dto.message);
    const processingMs = this.randomDelayMs();

    this.logger.log(`Stylist chat intent=${intent} delay=${processingMs}ms`);

    await this.delay(processingMs);

    return {
      success: true,
      reply: CHAT_RESPONSES[intent],
      intent,
      processing_ms: processingMs,
    };
  }

  private detectIntent(message: string): ChatIntent {
    const text = message.toLowerCase();

    if (text.includes('interview') || text.includes('office') || text.includes('formal meeting')) {
      return 'interview';
    }

    if (text.includes('wedding') || text.includes('festive') || text.includes('ceremony')) {
      return 'wedding';
    }

    if (
      text.includes('budget') ||
      text.includes('under ₹') ||
      text.includes('under rs') ||
      text.includes('5000') ||
      text.includes('₹5,000') ||
      text.includes('affordable') ||
      text.includes('cheap')
    ) {
      return 'budget';
    }

    return 'general';
  }

  private randomDelayMs(): number {
    return (
      CHAT_MIN_DELAY_MS +
      Math.floor(Math.random() * (CHAT_MAX_DELAY_MS - CHAT_MIN_DELAY_MS + 1))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
