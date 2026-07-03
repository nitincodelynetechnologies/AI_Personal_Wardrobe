import { getApiBaseUrl } from '@/features/auth/services/apiClient';

export const SUPPORT_SOCKET_EVENTS = {
  JOIN: 'support:join',
  MESSAGE: 'support:message',
  TICKET: 'support:ticket',
  HANDOFF: 'support:handoff',
};

export function resolveSupportSocketUrl() {
  const configured = (process.env.NEXT_PUBLIC_SUPPORT_SOCKET_URL || '').trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  if (apiBase.endsWith('/api')) {
    return apiBase.slice(0, -4);
  }

  return apiBase;
}

let socketRef = null;
let socketHandlers = {};

export async function connectSupportSocket({ role = 'user', email, token, handlers = {} }) {
  if (typeof window === 'undefined') return null;

  const { io } = await import('socket.io-client');
  const socketUrl = resolveSupportSocketUrl();

  if (!socketRef) {
    socketRef = io(`${socketUrl}/support`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token: token ?? null,
        email: email ?? null,
        role,
      },
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.on('connect', () => {
      socketRef.emit(SUPPORT_SOCKET_EVENTS.JOIN, { role, email });
    });

    socketRef.on(SUPPORT_SOCKET_EVENTS.TICKET, (ticket) => {
      socketHandlers.onTicket?.(ticket);
    });

    socketRef.on(SUPPORT_SOCKET_EVENTS.MESSAGE, (payload) => {
      socketHandlers.onMessage?.(payload);
    });

    socketRef.on(SUPPORT_SOCKET_EVENTS.HANDOFF, (ticket) => {
      socketHandlers.onHandoff?.(ticket);
    });
  }

  socketHandlers = { ...socketHandlers, ...handlers };

  if (socketRef?.connected) {
    socketRef.emit(SUPPORT_SOCKET_EVENTS.JOIN, { role, email });
  }

  return socketRef;
}

export function disconnectSupportSocket() {
  if (socketRef) {
    socketRef.removeAllListeners();
    socketRef.disconnect();
    socketRef = null;
    socketHandlers = {};
  }
}

export function getSupportSocket() {
  return socketRef;
}
