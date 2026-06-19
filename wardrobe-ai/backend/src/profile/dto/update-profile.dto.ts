import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'female', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @ApiPropertyOptional({ example: 28 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ example: 165.5, description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 62.0, description: 'Weight in kilograms' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'athletic', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  body_type?: string;

  @ApiPropertyOptional({ example: 'medium', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  skin_tone?: string;
}
