const { ApiProperty } = require('@nestjs/swagger');

class FaceLoginDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Face image for biometric login',
  })
  face;
}

module.exports = { FaceLoginDto };
