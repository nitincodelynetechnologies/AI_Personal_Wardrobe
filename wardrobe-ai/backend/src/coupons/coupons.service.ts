import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { POSTGRES_TABLES } from '../database/schema.registry';

export interface CouponRecord {
  id: number;
  code: string;
  discount: string | number;
  type: 'percent' | 'flat';
  status: 'active' | 'inactive';
  description: string | null;
  uses: number;
  created_at: Date;
  updated_at: Date;
}

export interface PlatformCoupon {
  id: number;
  code: string;
  discount: number;
  type: 'percent' | 'flat';
  status: 'active' | 'inactive';
  description?: string | null;
  uses: number;
}

@Injectable()
export class CouponsService {
  constructor(private readonly postgresService: PostgresService) {}

  async listCoupons(): Promise<PlatformCoupon[]> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<CouponRecord>(
      `SELECT * FROM ${POSTGRES_TABLES.COUPONS} ORDER BY created_at DESC`,
    );

    return result.rows.map((row) => this.toPlatformCoupon(row));
  }

  async getActiveCoupon(): Promise<PlatformCoupon | null> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<CouponRecord>(
      `SELECT * FROM ${POSTGRES_TABLES.COUPONS}
       WHERE status = 'active'
       ORDER BY updated_at DESC
       LIMIT 1`,
    );

    return result.rows[0] ? this.toPlatformCoupon(result.rows[0]) : null;
  }

  async createCoupon(input: {
    code: string;
    discount: number;
    type: 'percent' | 'flat';
  }): Promise<PlatformCoupon> {
    this.postgresService.assertReady();

    const code = input.code.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Coupon code is required');
    }

    const result = await this.postgresService.query<CouponRecord>(
      `INSERT INTO ${POSTGRES_TABLES.COUPONS} (code, discount, type, status)
       VALUES ($1, $2, $3, 'inactive')
       RETURNING *`,
      [code, input.discount, input.type],
    );

    return this.toPlatformCoupon(result.rows[0]);
  }

  async setCouponStatus(couponId: number, status: 'active' | 'inactive'): Promise<PlatformCoupon> {
    this.postgresService.assertReady();

    if (status === 'active') {
      await this.postgresService.query(
        `UPDATE ${POSTGRES_TABLES.COUPONS} SET status = 'inactive', updated_at = NOW()`,
      );
    }

    const result = await this.postgresService.query<CouponRecord>(
      `UPDATE ${POSTGRES_TABLES.COUPONS}
       SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [couponId, status],
    );

    const record = result.rows[0];
    if (!record) {
      throw new NotFoundException(`Coupon ${couponId} not found`);
    }

    return this.toPlatformCoupon(record);
  }

  private toPlatformCoupon(record: CouponRecord): PlatformCoupon {
    return {
      id: record.id,
      code: record.code,
      discount: Number(record.discount),
      type: record.type,
      status: record.status,
      description: record.description,
      uses: record.uses,
    };
  }
}
