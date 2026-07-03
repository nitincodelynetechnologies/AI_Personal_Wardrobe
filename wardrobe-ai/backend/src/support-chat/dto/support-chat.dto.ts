import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendSupportMessageDto {
  @ApiProperty({ example: 'Where is my order?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text!: string;

  @ApiPropertyOptional({ example: 'Priya Sharma' })
  @IsString()
  @MaxLength(255)
  name?: string;
}

export class SaveSupportBotReplyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ticketId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  text!: string;
}

export class AdminSupportReplyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  text!: string;
}
