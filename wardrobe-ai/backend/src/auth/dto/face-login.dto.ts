import { ApiProperty } from '@nestjs/swagger';

/** Swagger-only schema for multipart face login (image sent as form field `face`). */
export class FaceLoginDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Face image for biometric login' })
  face: unknown;
}
