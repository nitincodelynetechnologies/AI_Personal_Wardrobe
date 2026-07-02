import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active platform coupon (public)' })
  async getActiveCoupon() {
    const coupon = await this.couponsService.getActiveCoupon();
    return { coupon };
  }
}
