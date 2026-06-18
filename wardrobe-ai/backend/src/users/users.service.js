const {
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
} = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const bcrypt = require('bcryptjs');
const { PostgresService } = require('../database/postgres.service');

@Injectable()
class UsersService {
  constructor(
    @Inject(PostgresService) postgresService,
    @Inject(ConfigService) configService,
  ) {
    this.postgresService = postgresService;
    this.configService = configService;
  }

  async createUser(input) {
    const rounds = this.configService.get('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(input.password, rounds);

    if (input.email) {
      const existing = await this.findByEmail(input.email);
      if (existing) throw new ConflictException('Email is already registered');
    }

    if (input.mobile) {
      const existing = await this.findByMobile(input.mobile);
      if (existing) throw new ConflictException('Mobile number is already registered');
    }

    const result = await this.postgresService.query(
      `INSERT INTO wardrobe.users (email, mobile, password_hash, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, mobile, status, created_at`,
      [input.email ?? null, input.mobile ?? null, passwordHash, input.status ?? 'active'],
    );

    return result.rows[0];
  }

  async findById(id) {
    const result = await this.postgresService.query(
      `SELECT id, email, mobile, status, created_at
       FROM wardrobe.users WHERE id = $1 AND status <> 'deleted'`,
      [id],
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email) {
    const result = await this.postgresService.query(
      `SELECT id, email, mobile, password_hash, status, created_at, updated_at
       FROM wardrobe.users WHERE LOWER(email) = LOWER($1) AND status <> 'deleted'`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findByMobile(mobile) {
    const result = await this.postgresService.query(
      `SELECT id, email, mobile, password_hash, status, created_at, updated_at
       FROM wardrobe.users WHERE mobile = $1 AND status <> 'deleted'`,
      [mobile],
    );
    return result.rows[0] ?? null;
  }
}

module.exports = { UsersService };
