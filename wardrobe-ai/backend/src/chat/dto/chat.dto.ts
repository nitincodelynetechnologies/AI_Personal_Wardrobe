import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ example: 'What should I wear for an interview?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}

export class ChatResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  reply: string;

  @ApiProperty({ example: 'interview' })
  intent: string;

  @ApiProperty()
  processing_ms: number;
}
