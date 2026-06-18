const {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} = require('class-validator');
const { ApiProperty, ApiPropertyOptional } = require('@nestjs/swagger');

class FaceRegisterDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.mobile)
  email;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.email)
  mobile;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  name;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar_url;
}

module.exports = { FaceRegisterDto };
