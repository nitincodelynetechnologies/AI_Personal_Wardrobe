import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { CreateOrderDto } from './dto/create-order.dto';

export interface OrderRecord {
  id: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  status: string;
  amount: string | number;
  item_count: number;
  payment_method: string | null;
  shipping: Record<string, unknown>;
  line_items: Array<Record<string, unknown>>;
  products: string[];
  source: string;
  created_at: Date;
  updated_at: Date;
}

export interface PlatformOrder {
  id: string;
  customer: string;
  email: string;
  status: string;
  amount: number;
  items: number;
  date: string;
  products: string[];
  lineItems: Array<{ name: string; variant: string; qty: number; price: number }>;
  paymentMethod?: string | null;
  shipping?: Record<string, unknown>;
  source: string;
  createdAt: string;
  userUnreadUpdate: boolean;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly postgresService: PostgresService) {}

  async createOrder(
    dto: CreateOrderDto,
    userId?: string | null,
  ): Promise<PlatformOrder> {
    this.postgresService.assertReady();

    if (!dto.items?.length) {
      throw new BadRequestException('Order must include at least one item');
    }

    const orderId = dto.id?.trim() || this.generateOrderId();
    const shipping = {
      fullName: dto.shipping.fullName.trim(),
      email: dto.shipping.email.trim().toLowerCase(),
      address: dto.shipping.address.trim(),
      city: dto.shipping.city.trim(),
      pincode: dto.shipping.pincode.trim(),
    };

    const lineItems = dto.items.map((item) => ({
      name: item.name,
      variant: item.brand?.trim() || 'Standard',
      qty: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      productId: item.productId ?? null,
    }));

    const products = lineItems.map((item) => item.name);
    const itemCount = lineItems.reduce((sum, item) => sum + item.qty, 0);
    const amount = Number(dto.total) || 0;

    const result = await this.postgresService.query<OrderRecord>(
      `INSERT INTO ${POSTGRES_TABLES.ORDERS}
        (id, user_id, customer_name, email, status, amount, item_count, payment_method, shipping, line_items, products, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12)
       RETURNING *`,
      [
        orderId,
        userId ?? null,
        shipping.fullName,
        shipping.email,
        'Pending',
        amount,
        itemCount,
        dto.paymentMethod,
        JSON.stringify(shipping),
        JSON.stringify(lineItems),
        JSON.stringify(products),
        'checkout',
      ],
    );

    const record = result.rows[0];
    this.logger.log(`Order created: ${record.id} (${shipping.email})`);
    return this.toPlatformOrder(record);
  }

  async listOrders(): Promise<PlatformOrder[]> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<OrderRecord>(
      `SELECT * FROM ${POSTGRES_TABLES.ORDERS}
       ORDER BY created_at DESC`,
    );

    return result.rows.map((row) => this.toPlatformOrder(row));
  }

  async listOrdersForUser(userId: string): Promise<PlatformOrder[]> {
    this.postgresService.assertReady();

    if (!userId?.trim()) {
      return [];
    }

    const result = await this.postgresService.query<OrderRecord>(
      `SELECT * FROM ${POSTGRES_TABLES.ORDERS}
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows.map((row) => this.toPlatformOrder(row));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<PlatformOrder> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<OrderRecord>(
      `UPDATE ${POSTGRES_TABLES.ORDERS}
       SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId, status.trim()],
    );

    const record = result.rows[0];
    if (!record) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return this.toPlatformOrder(record);
  }

  async countRegisteredUsers(): Promise<number> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${POSTGRES_TABLES.USERS}
       WHERE status <> 'deleted'`,
    );

    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  private generateOrderId(): string {
    const suffix = Math.floor(80000 + Math.random() * 19999);
    return `ORD-${suffix}`;
  }

  private toPlatformOrder(record: OrderRecord): PlatformOrder {
    const lineItems = Array.isArray(record.line_items)
      ? record.line_items.map((item) => ({
          name: String(item.name ?? ''),
          variant: String(item.variant ?? 'Standard'),
          qty: Number(item.qty ?? 1),
          price: Number(item.price ?? 0),
        }))
      : [];

    const products = Array.isArray(record.products)
      ? record.products.map((item) => String(item))
      : lineItems.map((item) => item.name);

    const createdAt = new Date(record.created_at).toISOString();

    return {
      id: record.id,
      customer: record.customer_name,
      email: record.email,
      status: record.status,
      amount: Number(record.amount) || 0,
      items: record.item_count,
      date: createdAt.slice(0, 10),
      products,
      lineItems,
      paymentMethod: record.payment_method,
      shipping:
        record.shipping && typeof record.shipping === 'object' ? record.shipping : undefined,
      source: record.source,
      createdAt,
      userUnreadUpdate: false,
    };
  }
}
