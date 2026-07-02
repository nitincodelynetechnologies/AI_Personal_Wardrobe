import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CouponsModule } from '../coupons/coupons.module';
import { DatabaseModule } from '../database/database.module';
import { AdminGuard } from '../admin/admin.guard';
import { AdminController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [DatabaseModule, AuthModule, CouponsModule],
  controllers: [OrdersController, AdminController],
  providers: [OrdersService, AdminGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
