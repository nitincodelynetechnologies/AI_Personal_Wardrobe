import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import { VtonGenerateResponseDto } from './dto/vton-generate.dto';
import { VtonService } from './vton.service';

const VTON_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;

@ApiTags('vton')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vton')
export class VtonController {
  constructor(private readonly vtonService: VtonService) {}

  @Post('try-on')
  @ApiOperation({ summary: 'Generate IDM-VTON virtual try-on from body + garment images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['user_image', 'garment_image'],
      properties: {
        user_image: { type: 'string', format: 'binary' },
        garment_image: { type: 'string', format: 'binary' },
        garment_description: { type: 'string', example: 'Blue denim jeans' },
      },
    },
  })
  @ApiResponse({ status: 201, type: VtonGenerateResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'user_image', maxCount: 1 },
        { name: 'garment_image', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: VTON_UPLOAD_LIMIT_BYTES },
      },
    ),
  )
  async generateTryOn(
    @CurrentUser() user: PublicUser,
    @UploadedFiles()
    files: {
      user_image?: Express.Multer.File[];
      garment_image?: Express.Multer.File[];
    },
    @Body('garment_description') garmentDescription?: string,
  ) {
    const userImage = files.user_image?.[0];
    const garmentImage = files.garment_image?.[0];

    if (!userImage) {
      throw new BadRequestException('user_image is required');
    }
    if (!garmentImage) {
      throw new BadRequestException('garment_image is required');
    }

    const result = await this.vtonService.generateTryOn(
      userImage,
      garmentImage,
      garmentDescription,
    );

    return {
      ...result,
      user_id: user.id,
    };
  }
}
