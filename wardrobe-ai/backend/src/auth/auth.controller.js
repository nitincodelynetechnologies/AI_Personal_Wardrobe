const {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} = require('@nestjs/common');
const {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} = require('@nestjs/swagger');
const { FileFieldsInterceptor, FileInterceptor } = require('@nestjs/platform-express');
const { memoryStorage } = require('multer');
const { AuthService } = require('./auth.service');
const { AuthSuccessResponseDto } = require('./dto/auth-response.dto');
const { FaceLoginDto } = require('./dto/face-login.dto');
const { FaceRegisterDto } = require('./dto/face-register.dto');

const imageFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'), false);
    return;
  }
  cb(null, true);
};

@ApiTags('auth')
@Controller('auth')
class AuthController {
  constructor(@Inject(AuthService) authService) {
    this.authService = authService;
  }

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
      {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: imageFilter,
      },
    ),
  )
  faceRegister(@Body() dto, @UploadedFiles() files) {
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
  faceLogin(@UploadedFile() face) {
    return this.authService.loginWithFace(face);
  }
}

module.exports = { AuthController };
