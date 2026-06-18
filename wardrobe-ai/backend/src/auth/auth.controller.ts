import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { AuthSuccessResponseDto } from './dto/auth-response.dto';
import { FaceLoginDto } from './dto/face-login.dto';
import { FaceRegisterDto } from './dto/face-register.dto';

const imageFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'), false);
    return;
  }
  cb(null, true);
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('face-register')
  @ApiOperation({ summary: 'Register user with face biometrics' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['password', 'front', 'left', 'right', 'smile'],
      properties: {
        email: { type: 'string', format: 'email' },
        mobile: { type: 'string' },
        password: { type: 'string', minLength: 8 },
        name: { type: 'string' },
        avatar_url: { type: 'string' },
        front: { type: 'string', format: 'binary' },
        left: { type: 'string', format: 'binary' },
        right: { type: 'string', format: 'binary' },
        smile: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: AuthSuccessResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'front', maxCount: 1 },
        { name: 'left', maxCount: 1 },
        { name: 'right', maxCount: 1 },
        { name: 'smile', maxCount: 1 },
      ],
      { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter },
    ),
  )
  async faceRegister(
    @Body() dto: FaceRegisterDto,
    @UploadedFiles()
    files: {
      front?: Express.Multer.File[];
      left?: Express.Multer.File[];
      right?: Express.Multer.File[];
      smile?: Express.Multer.File[];
    },
  ) {
    return this.authService.registerWithFace(dto, files);
  }

  @Post('face-login')
  @ApiOperation({ summary: 'Login with face biometrics' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FaceLoginDto })
  @ApiResponse({ status: 200, type: AuthSuccessResponseDto })
  @UseInterceptors(
    FileInterceptor('face', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: imageFilter,
    }),
  )
  async faceLogin(@UploadedFile() face: Express.Multer.File) {
    return this.authService.loginWithFace(face);
  }
}
