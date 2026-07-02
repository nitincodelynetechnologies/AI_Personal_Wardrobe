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

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
  constructor(private readonly ordersService: OrdersService) {}

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
}
