import { getApiBaseUrl, ApiError } from '@/features/auth/services/apiClient';
import { getSessionToken } from '@/features/auth/utils/sessionToken';

async function supportFetch(endpoint, options = {}) {
  const { method = 'GET', body, token } = options;
  const accessToken = token ?? getSessionToken();

  if (!accessToken) {
    throw new ApiError('Support chat requires you to be signed in.', 401, null);
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    credentials: 'include',
    mode: 'cors',
  });

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType?.includes('application/json')) {
    const raw = await response.text();
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new ApiError('Support API returned invalid JSON', response.status, raw?.slice(0, 200));
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
        : `Support request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export function sendSupportMessage({ text, name, token }) {
  return supportFetch('/support/messages', {
    method: 'POST',
    body: { text, name },
    token,
  });
}

export function saveSupportBotReply({ ticketId, text, token }) {
  return supportFetch('/support/messages/bot-reply', {
    method: 'POST',
    body: { ticketId, text },
    token,
  });
}

export function fetchMySupportTickets(token) {
  return supportFetch('/support/tickets', { token });
}

export function fetchAdminSupportTickets(token) {
  return supportFetch('/support/admin/tickets', { token });
}

export function fetchAdminSupportUnreadCount(token) {
  return supportFetch('/support/admin/unread-count', { token });
}

export function sendAdminSupportReply(ticketId, text, token) {
  return supportFetch(`/support/admin/tickets/${ticketId}/replies`, {
    method: 'POST',
    body: { text },
    token,
  });
}

export function markAdminSupportTicketRead(ticketId, token) {
  return supportFetch(`/support/admin/tickets/${ticketId}/read`, {
    method: 'PATCH',
    token,
  });
}

export function flattenTicketMessages(tickets = []) {
  return tickets
    .flatMap((ticket) => ticket.messages ?? [])
    .sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime());
}

export function getActiveSupportTicket(tickets = []) {
  return (
    tickets.find((ticket) => ticket.sessionState === 'waiting_for_admin') ??
    tickets.find((ticket) => ticket.status === 'Open' || ticket.status === 'Updated') ??
    tickets.find((ticket) => ticket.status === 'Waiting for Admin') ??
    tickets[0] ??
    null
  );
}
