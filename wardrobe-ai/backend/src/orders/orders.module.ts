import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../admin/admin.guard';
import { AdminController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, AdminController],
  providers: [OrdersService, AdminGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
