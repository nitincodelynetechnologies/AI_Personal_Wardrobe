import { Body, Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import { GenerateOutfitDto } from './dto/generate-outfit.dto';
import { OutfitFeedbackDto } from './dto/outfit-feedback.dto';
import {
  GenerateOutfitResponseDto,
  OutfitsListResponseDto,
} from './dto/outfit-response.dto';
import { OutfitsService } from './outfits.service';

@ApiTags('outfits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('outfits')
export class OutfitsController {
  private readonly logger = new Logger(OutfitsController.name);

  constructor(private readonly outfitsService: OutfitsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate and save a new AI outfit recommendation' })
  @ApiResponse({ status: 201, type: GenerateOutfitResponseDto })
  async generateOutfit(@CurrentUser() user: PublicUser, @Body() dto: GenerateOutfitDto) {
    const outfit = await this.outfitsService.generateOutfit(user.id, dto);
    return { outfit };
  }

  @Get()
  @ApiOperation({ summary: 'List all saved outfits for the authenticated user' })
  @ApiResponse({ status: 200, type: OutfitsListResponseDto })
  async getOutfits(@CurrentUser() user: PublicUser) {
    const outfits = await this.outfitsService.getOutfitsByUserId(user.id);
    return { outfits };
  }

  @Put(':id/feedback')
  @ApiOperation({ summary: 'Submit like/dislike feedback for an outfit recommendation' })
  @ApiResponse({ status: 200, type: GenerateOutfitResponseDto })
  async updateOutfitFeedback(
    @CurrentUser() user: PublicUser,
    @Param('id', ParseUUIDPipe) outfitId: string,
    @Body() dto: OutfitFeedbackDto,
  ) {
    console.log('Received ID for feedback:', outfitId, 'user:', user.id, 'is_favorite:', dto.is_favorite);
    this.logger.log(`Outfit feedback request — outfit=${outfitId} user=${user.id} favorite=${dto.is_favorite}`);

    const outfit = await this.outfitsService.updateOutfitFeedback(
      user.id,
      outfitId,
      dto.is_favorite,
    );

    return { outfit };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved outfit recommendation' })
  @ApiResponse({ status: 200, description: 'Outfit deleted successfully' })
  async deleteOutfit(
    @CurrentUser() user: PublicUser,
    @Param('id', ParseUUIDPipe) outfitId: string,
  ) {
    console.log('Received ID for deletion:', outfitId, 'user:', user.id);
    this.logger.log(`Outfit delete request — outfit=${outfitId} user=${user.id}`);

    return this.outfitsService.deleteOutfit(user.id, outfitId);
  }
}
