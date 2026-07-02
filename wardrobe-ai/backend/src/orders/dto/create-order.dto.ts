import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderLineItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;
}

export class OrderShippingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pincode: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'ORD-81234' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ type: [OrderLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineItemDto)
  items: OrderLineItemDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ type: OrderShippingDto })
  @ValidateNested()
  @Type(() => OrderShippingDto)
  shipping: OrderShippingDto;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  total: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'Shipped' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
