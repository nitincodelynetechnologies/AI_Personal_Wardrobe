import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TryOnRequestDto, TryOnResponseDto } from './dto/try-on.dto';
import { TryOnService } from './try-on.service';

@ApiTags('try-on')
@Controller('try-on')
export class TryOnController {
  constructor(private readonly tryOnService: TryOnService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a virtual try-on render (stub)' })
  @ApiResponse({ status: 201, type: TryOnResponseDto })
  async createTryOn(@Body() dto: TryOnRequestDto) {
    return this.tryOnService.generateTryOn(dto);
  }
}
