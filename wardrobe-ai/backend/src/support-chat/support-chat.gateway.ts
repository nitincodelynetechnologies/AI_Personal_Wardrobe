import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export const SUPPORT_SOCKET_EVENTS = {
  JOIN: 'support:join',
  MESSAGE: 'support:message',
  TICKET: 'support:ticket',
  HANDOFF: 'support:handoff',
} as const;

@WebSocketGateway({
  namespace: '/support',
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowlist = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

      const defaults = [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003',
        'https://ai-personal-wardrobe-1.onrender.com',
        'https://ai-personal-wardrobe.onrender.com',
      ];

      if ([...defaults, ...allowlist].includes(origin)) {
        callback(null, true);
        return;
      }

      if (process.env.CORS_ALLOW_ONRENDER !== 'false' && origin.endsWith('.onrender.com')) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  },
})
export class SupportChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SupportChatGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    this.logger.debug(`Support socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Support socket disconnected: ${client.id}`);
  }

  @SubscribeMessage(SUPPORT_SOCKET_EVENTS.JOIN)
  handleJoin(
    client: Socket,
    payload: { role?: 'user' | 'admin'; email?: string },
  ): { joined: boolean } {
    const role = payload?.role ?? 'user';
    const email = (payload?.email ?? '').trim().toLowerCase();

    if (role === 'admin') {
      client.join('admins');
    }

    if (email) {
      client.join(this.userRoom(email));
    }

    return { joined: true };
  }

  emitTicketUpdate(ticket: unknown, email: string): void {
    this.server.to(this.userRoom(email)).emit(SUPPORT_SOCKET_EVENTS.TICKET, ticket);
    this.server.to('admins').emit(SUPPORT_SOCKET_EVENTS.TICKET, ticket);
  }

  emitMessage(ticketId: string, message: unknown, email: string): void {
    const payload = { ticketId, message };
    this.server.to(this.userRoom(email)).emit(SUPPORT_SOCKET_EVENTS.MESSAGE, payload);
    this.server.to('admins').emit(SUPPORT_SOCKET_EVENTS.MESSAGE, payload);
  }

  emitHandoffRequest(ticket: unknown): void {
    this.server.to('admins').emit(SUPPORT_SOCKET_EVENTS.HANDOFF, ticket);
  }

  private userRoom(email: string): string {
    return `user:${email.trim().toLowerCase()}`;
  }
}
