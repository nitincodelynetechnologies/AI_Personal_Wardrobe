import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import { AdminGuard } from '../admin/admin.guard';
import { CreateOrderDto, UpdateOrderStatusDto } from '../orders/dto/create-order.dto';
import { OrdersService } from '../orders/orders.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateCouponDto, UpdateCouponStatusDto } from '../coupons/dto/coupon.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders for the authenticated user' })
  @ApiResponse({ status: 200, description: 'User-scoped order history' })
  async listMyOrders(@CurrentUser() user: PublicUser) {
    const orders = await this.ordersService.listOrdersForUser(user.id);
    return { orders };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a checkout order (persists to database)' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: PublicUser,
  ) {
    const order = await this.ordersService.createOrder(dto, user.id);
    return { success: true, order };
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly couponsService: CouponsService,
  ) {}

  @Get('orders')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'List all orders (admin only)' })
  async listOrders() {
    const orders = await this.ordersService.listOrders();
    return { orders };
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update order status (admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateOrderStatus(id, dto.status);
    return { success: true, order };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin dashboard stats (orders + registered users)' })
  async stats() {
    const [orders, registeredUsers] = await Promise.all([
      this.ordersService.listOrders(),
      this.ordersService.countRegisteredUsers(),
    ]);

    return {
      orders,
      registeredUsers,
    };
  }

  @Get('coupons')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'List all coupons (admin only)' })
  async listCoupons() {
    const coupons = await this.couponsService.listCoupons();
    return { coupons };
  }

  @Post('coupons')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a coupon (admin only)' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.couponsService.createCoupon(dto);
    return { success: true, coupon };
  }

  @Patch('coupons/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Activate or deactivate a coupon (admin only)' })
  async updateCouponStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCouponStatusDto,
  ) {
    const coupon = await this.couponsService.setCouponStatus(
      parseInt(id, 10),
      dto.status,
    );
    return { success: true, coupon };
  }
}
