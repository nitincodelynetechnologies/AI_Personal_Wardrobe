import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import { createWardrobeUploadOptions } from './config/multer.config';
import { ClothingItemDto, WardrobeItemsResponseDto } from './dto/clothing-item-response.dto';
import { UploadClothingDto } from './dto/upload-clothing.dto';
import { WardrobeService } from './wardrobe.service';

@ApiTags('wardrobe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wardrobe')
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a clothing item with image and metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image', 'category'],
      properties: {
        image: { type: 'string', format: 'binary' },
        category: { type: 'string', example: 'Top' },
        sub_category: { type: 'string', example: 'T-Shirt' },
        color_hex: { type: 'string', example: '#1A2B3C' },
        season: { type: 'string', example: 'All' },
      },
    },
  })
  @ApiResponse({ status: 201, type: ClothingItemDto })
  @UseInterceptors(
    FileInterceptor(
      'image',
      createWardrobeUploadOptions(
        parseInt(process.env.WARDROBE_MAX_FILE_SIZE_MB || '5', 10),
      ),
    ),
  )
  async uploadClothing(
    @CurrentUser() user: PublicUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadClothingDto,
  ) {
    return this.wardrobeService.uploadClothing(user.id, file, dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List all clothing items for the authenticated user' })
  @ApiResponse({ status: 200, type: WardrobeItemsResponseDto })
  async getItems(@CurrentUser() user: PublicUser) {
    const items = await this.wardrobeService.getItemsByUserId(user.id);
    return { items };
  }
}
