import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class OutfitFeedbackDto {
  @ApiProperty({ example: true, description: 'true = liked, false = disliked' })
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_favorite: boolean;
}
