const { ApiProperty } = require('@nestjs/swagger');

class PublicUserDto {
  @ApiProperty({ format: 'uuid', type: String })
  id;

  @ApiProperty({ nullable: true, type: String })
  email;

  @ApiProperty({ nullable: true, type: String })
  mobile;

  @ApiProperty({ example: 'active', type: String })
  status;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at;
}

class AuthSuccessResponseDto {
  @ApiProperty({ example: true, type: Boolean })
  success;

  @ApiProperty({ example: 'Face registration completed successfully', type: String })
  message;

  @ApiProperty({ type: () => PublicUserDto })
  user;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: String })
  jwt_token;
}

module.exports = { PublicUserDto, AuthSuccessResponseDto };
