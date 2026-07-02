import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'AI30OFF' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  discount: number;

  @ApiProperty({ enum: ['percent', 'flat'] })
  @IsIn(['percent', 'flat'])
  type: 'percent' | 'flat';
}

export class UpdateCouponStatusDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}
