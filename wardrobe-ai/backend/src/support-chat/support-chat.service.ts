import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { PostgresService } from '../database/postgres.service';
import { PublicUser } from '../users/interfaces/user.interface';
import {
  HUMAN_HANDOFF_REPLY,
  HUMAN_HANDOFF_WAITING_REPLY,
  wantsHumanHandoff,
} from './constants/support-handoff.constants';
import { SupportChatGateway } from './support-chat.gateway';

type SupportSender = 'user' | 'admin' | 'system' | 'bot';

interface SupportTicketRow {
  id: string;
  public_id: string;
  user_id: string | null;
  user_name: string | null;
  email: string;
  subject: string | null;
  status: string;
  session_state: string;
  admin_unread: boolean;
  user_unread: boolean;
  created_at: Date;
  updated_at: Date;
}

interface SupportMessageRow {
  id: string;
  ticket_id: string;
  sender: SupportSender;
  text: string;
  created_at: Date;
}

export interface SupportMessageDto {
  id: string;
  sender: SupportSender;
  role: SupportSender;
  text: string;
  at: string;
  timestamp: string;
}

export interface SupportTicketDto {
  id: string;
  user: string;
  email: string;
  subject: string;
  message: string;
  messages: SupportMessageDto[];
  status: string;
  sessionState: string;
  adminReply: string;
  userUnread: boolean;
  adminUnread: boolean;
  createdAt: string;
}

@Injectable()
export class SupportChatService {
  private readonly logger = new Logger(SupportChatService.name);

  constructor(
    private readonly postgresService: PostgresService,
    private readonly gateway: SupportChatGateway,
  ) {}

  async sendUserMessage(
    user: PublicUser,
    text: string,
    displayName?: string,
  ): Promise<{
    ticket: SupportTicketDto;
    messages: SupportMessageDto[];
    handoff: boolean;
    pendingAi: boolean;
  }> {
    this.postgresService.assertReady();

    const normalizedEmail = (user.email ?? '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('A verified account email is required for support chat');
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw new BadRequestException('Message text is required');
    }

    const ticket = await this.findOrCreateActiveTicket(
      user.id,
      normalizedEmail,
      displayName ?? user.email ?? 'Customer',
      trimmed,
    );

    const userMessage = await this.insertMessage(ticket.id, 'user', trimmed);
    let handoff = false;
    let pendingAi = false;

    if (ticket.session_state === 'waiting_for_admin') {
      handoff = true;
      await this.markTicketActivity(ticket.id, {
        status: 'waiting_for_admin',
        adminUnread: true,
        userUnread: false,
      });
      await this.insertMessage(ticket.id, 'system', HUMAN_HANDOFF_WAITING_REPLY);
    } else if (wantsHumanHandoff(trimmed)) {
      handoff = true;
      await this.markTicketActivity(ticket.id, {
        status: 'waiting_for_admin',
        sessionState: 'waiting_for_admin',
        adminUnread: true,
        userUnread: false,
      });
      await this.insertMessage(ticket.id, 'system', HUMAN_HANDOFF_REPLY);
    } else {
      pendingAi = true;
      await this.markTicketActivity(ticket.id, {
        status: ticket.status === 'answered' ? 'updated' : 'open',
        adminUnread: true,
        userUnread: false,
      });
    }

    const hydrated = await this.getTicketDtoByPublicId(ticket.public_id);
    this.gateway.emitMessage(hydrated.id, userMessage, normalizedEmail);
    this.gateway.emitTicketUpdate(hydrated, normalizedEmail);

    if (handoff) {
      this.gateway.emitHandoffRequest(hydrated);
    }

    return {
      ticket: hydrated,
      messages: hydrated.messages,
      handoff,
      pendingAi,
    };
  }

  async saveBotReply(user: PublicUser, ticketPublicId: string, text: string) {
    this.postgresService.assertReady();

    const ticket = await this.getTicketRowByPublicId(ticketPublicId);
    const normalizedEmail = (user.email ?? '').trim().toLowerCase();

    if (ticket.email !== normalizedEmail) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.session_state === 'waiting_for_admin') {
      throw new BadRequestException('AI replies are disabled while waiting for a human agent');
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw new BadRequestException('Bot reply text is required');
    }

    await this.insertMessage(ticket.id, 'bot', trimmed);
    await this.markTicketActivity(ticket.id, {
      status: ticket.status === 'open' ? 'open' : ticket.status,
      userUnread: true,
      adminUnread: false,
    });

    const hydrated = await this.getTicketDtoByPublicId(ticket.public_id);
    this.gateway.emitTicketUpdate(hydrated, normalizedEmail);

    return {
      ticket: hydrated,
      messages: hydrated.messages,
    };
  }

  async listTicketsForUser(user: PublicUser): Promise<SupportTicketDto[]> {
    this.postgresService.assertReady();
    const normalizedEmail = (user.email ?? '').trim().toLowerCase();
    if (!normalizedEmail) return [];

    const result = await this.postgresService.query<SupportTicketRow>(
      `SELECT id, public_id, user_id, user_name, email, subject, status, session_state,
              admin_unread, user_unread, created_at, updated_at
       FROM ${POSTGRES_TABLES.SUPPORT_TICKETS}
       WHERE LOWER(email) = LOWER($1)
       ORDER BY updated_at DESC`,
      [normalizedEmail],
    );

    return Promise.all(result.rows.map((row) => this.hydrateTicket(row)));
  }

  async listTicketsForAdmin(): Promise<SupportTicketDto[]> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<SupportTicketRow>(
      `SELECT id, public_id, user_id, user_name, email, subject, status, session_state,
              admin_unread, user_unread, created_at, updated_at
       FROM ${POSTGRES_TABLES.SUPPORT_TICKETS}
       ORDER BY updated_at DESC
       LIMIT 200`,
    );

    return Promise.all(result.rows.map((row) => this.hydrateTicket(row)));
  }

  async getUnreadCountForAdmin(): Promise<number> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM ${POSTGRES_TABLES.SUPPORT_TICKETS}
       WHERE admin_unread = TRUE`,
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async sendAdminReply(ticketPublicId: string, text: string): Promise<SupportTicketDto> {
    this.postgresService.assertReady();

    const ticket = await this.getTicketRowByPublicId(ticketPublicId);
    const trimmed = text.trim();
    if (!trimmed) {
      throw new BadRequestException('Reply text is required');
    }

    await this.insertMessage(ticket.id, 'admin', trimmed);
    await this.markTicketActivity(ticket.id, {
      status: 'answered',
      sessionState: 'human_active',
      adminUnread: false,
      userUnread: true,
    });

    const hydrated = await this.getTicketDtoByPublicId(ticket.public_id);
    this.gateway.emitTicketUpdate(hydrated, ticket.email);

    return hydrated;
  }

  async markAdminTicketRead(ticketPublicId: string): Promise<void> {
    const ticket = await this.getTicketRowByPublicId(ticketPublicId);
    await this.markTicketActivity(ticket.id, { adminUnread: false });
  }

  private async findOrCreateActiveTicket(
    userId: string,
    email: string,
    userName: string,
    firstMessage: string,
  ): Promise<SupportTicketRow> {
    const existing = await this.postgresService.query<SupportTicketRow>(
      `SELECT id, public_id, user_id, user_name, email, subject, status, session_state,
              admin_unread, user_unread, created_at, updated_at
       FROM ${POSTGRES_TABLES.SUPPORT_TICKETS}
       WHERE LOWER(email) = LOWER($1)
         AND status IN ('open', 'updated', 'answered', 'waiting_for_admin')
       ORDER BY updated_at DESC
       LIMIT 1`,
      [email],
    );

    if (existing.rows[0]) {
      return existing.rows[0];
    }

    const publicId = `TKT-${Date.now()}`;
    const subject =
      firstMessage.length > 50 ? `${firstMessage.slice(0, 47)}…` : firstMessage;

    const created = await this.postgresService.query<SupportTicketRow>(
      `INSERT INTO ${POSTGRES_TABLES.SUPPORT_TICKETS}
        (public_id, user_id, user_name, email, subject, status, session_state, admin_unread, user_unread)
       VALUES ($1, $2, $3, $4, $5, 'open', 'ai', TRUE, FALSE)
       RETURNING id, public_id, user_id, user_name, email, subject, status, session_state,
                 admin_unread, user_unread, created_at, updated_at`,
      [publicId, userId, userName, email, subject],
    );

    return created.rows[0];
  }

  private async insertMessage(
    ticketId: string,
    sender: SupportSender,
    text: string,
  ): Promise<SupportMessageDto> {
    const result = await this.postgresService.query<SupportMessageRow>(
      `INSERT INTO ${POSTGRES_TABLES.SUPPORT_MESSAGES} (ticket_id, sender, text)
       VALUES ($1, $2, $3)
       RETURNING id, ticket_id, sender, text, created_at`,
      [ticketId, sender, text],
    );

    return this.mapMessage(result.rows[0]);
  }

  private async markTicketActivity(
    ticketId: string,
    patch: {
      status?: string;
      sessionState?: string;
      adminUnread?: boolean;
      userUnread?: boolean;
    },
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [ticketId];
    let index = 2;

    if (patch.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(patch.status);
    }
    if (patch.sessionState !== undefined) {
      fields.push(`session_state = $${index++}`);
      values.push(patch.sessionState);
    }
    if (patch.adminUnread !== undefined) {
      fields.push(`admin_unread = $${index++}`);
      values.push(patch.adminUnread);
    }
    if (patch.userUnread !== undefined) {
      fields.push(`user_unread = $${index++}`);
      values.push(patch.userUnread);
    }

    if (!fields.length) return;

    await this.postgresService.query(
      `UPDATE ${POSTGRES_TABLES.SUPPORT_TICKETS}
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $1`,
      values,
    );
  }

  private async getTicketRowByPublicId(publicId: string): Promise<SupportTicketRow> {
    const result = await this.postgresService.query<SupportTicketRow>(
      `SELECT id, public_id, user_id, user_name, email, subject, status, session_state,
              admin_unread, user_unread, created_at, updated_at
       FROM ${POSTGRES_TABLES.SUPPORT_TICKETS}
       WHERE public_id = $1`,
      [publicId],
    );

    const ticket = result.rows[0];
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  private async getTicketDtoByPublicId(publicId: string): Promise<SupportTicketDto> {
    const ticket = await this.getTicketRowByPublicId(publicId);
    return this.hydrateTicket(ticket);
  }

  private async hydrateTicket(ticket: SupportTicketRow): Promise<SupportTicketDto> {
    const messagesResult = await this.postgresService.query<SupportMessageRow>(
      `SELECT id, ticket_id, sender, text, created_at
       FROM ${POSTGRES_TABLES.SUPPORT_MESSAGES}
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticket.id],
    );

    const messages = messagesResult.rows.map((row) => this.mapMessage(row));
    const lastAdmin = [...messages].reverse().find((message) => message.sender === 'admin');

    return {
      id: ticket.public_id,
      user: ticket.user_name ?? 'Customer',
      email: ticket.email,
      subject: ticket.subject ?? '',
      message: messages.find((message) => message.sender === 'user')?.text ?? '',
      messages,
      status: this.mapStatusForClient(ticket.status),
      sessionState: ticket.session_state,
      adminReply: lastAdmin?.text ?? '',
      userUnread: ticket.user_unread,
      adminUnread: ticket.admin_unread,
      createdAt: ticket.created_at.toISOString(),
    };
  }

  private mapMessage(row: SupportMessageRow): SupportMessageDto {
    const at = row.created_at.toISOString();
    return {
      id: row.id,
      sender: row.sender,
      role: row.sender,
      text: row.text,
      at,
      timestamp: at,
    };
  }

  private mapStatusForClient(status: string): string {
    switch (status) {
      case 'waiting_for_admin':
        return 'Waiting for Admin';
      case 'answered':
        return 'Answered';
      case 'updated':
        return 'Updated';
      case 'open':
      default:
        return 'Open';
    }
  }

  ensureReady(): void {
    if (!this.postgresService.isReady()) {
      throw new ServiceUnavailableException(
        'Support chat database is unavailable. Start PostgreSQL and retry.',
      );
    }
  }
}
