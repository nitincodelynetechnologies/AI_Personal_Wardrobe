import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import { FashionDnaResponseDto } from './dto/fashion-dna-response.dto';
import { FashionDnaService } from './fashion-dna.service';

@ApiTags('fashion-dna')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fashion-dna')
export class FashionDnaController {
  constructor(private readonly fashionDnaService: FashionDnaService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch current Fashion DNA profile' })
  @ApiResponse({ status: 200, type: FashionDnaResponseDto })
  getFashionDna(@CurrentUser() user: PublicUser) {
    return this.fashionDnaService.getByUserId(user.id);
  }
}
