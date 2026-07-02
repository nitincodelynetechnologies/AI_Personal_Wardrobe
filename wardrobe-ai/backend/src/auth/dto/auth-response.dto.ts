import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ nullable: true })
  mobile: string | null;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiPropertyOptional({ example: 'admin' })
  role?: string;

  @ApiProperty()
  created_at: Date;
}

export class AuthSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Face registration completed successfully' })
  message: string;

  @ApiProperty({ type: () => PublicUserDto })
  user: PublicUserDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  jwt_token: string;
}
