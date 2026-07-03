'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useUserAccountEmail } from '@/features/shared/hooks/useUserAccountEmail';
import { useSupportNotifications } from '@/features/shared/hooks/useSupportNotifications';
import { getSessionToken } from '@/features/auth/utils/sessionToken';
import {
  generateBotResponse,
  loadSupportStoreContext,
} from '@/features/support/services/chatService';
import {
  fetchMySupportTickets,
  flattenTicketMessages,
  getActiveSupportTicket,
  saveSupportBotReply,
  sendSupportMessage,
} from '@/features/support/services/supportApiService';
import {
  connectSupportSocket,
} from '@/features/support/services/supportSocket';
import { useSupportChatStore } from '@/features/support/store/useSupportChatStore';

function formatMessageTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-sm shadow-sm dark:bg-[#2a1a35]">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s] dark:bg-slate-300" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s] dark:bg-slate-300" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-300" />
          <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">typing…</span>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const sender = message.sender ?? message.role ?? 'user';
  const isSystem = sender === 'system';
  const isAdminSide = sender === 'admin' || sender === 'bot' || sender === 'system';
  const timestamp = message.timestamp ?? message.at;

  if (isSystem) {
    return (
      <div className="flex justify-center px-2">
        <div className="max-w-[92%] rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isAdminSide ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
          isAdminSide
            ? 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-[#2a1a35] dark:text-slate-100'
            : 'rounded-br-md bg-magenta/15 text-slate-900 dark:bg-magenta/25 dark:text-white',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={cn(
            'mt-1 text-[10px] uppercase tracking-wider',
            isAdminSide ? 'text-slate-400' : 'text-magenta/70',
          )}
        >
          {sender === 'admin' ? 'Support · ' : sender === 'bot' ? 'AI · ' : 'You · '}
          {formatMessageTime(timestamp)}
        </p>
      </div>
    </div>
  );
}

export function SupportChatWidget() {
  const { displayName } = useAuthUser();
  const email = useUserAccountEmail();
  const { isOpen, closeChat } = useSupportChatStore();
  const { refresh: refreshNotifications } = useSupportNotifications();

  const [messages, setMessages] = useState([]);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const applyTicketState = useCallback((ticket) => {
    if (!ticket) return;
    setMessages(ticket.messages ?? []);
    setWaitingForAdmin(
      ticket.sessionState === 'waiting_for_admin' || ticket.status === 'Waiting for Admin',
    );
  }, []);

  const refreshFromApi = useCallback(async () => {
    const token = getSessionToken();
    if (!token || !email) return;

    try {
      const data = await fetchMySupportTickets(token);
      const tickets = data.tickets ?? [];
      const active = getActiveSupportTicket(tickets);
      if (active) {
        applyTicketState(active);
      } else {
        setMessages(flattenTicketMessages(tickets));
      }
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load support chat');
    }
  }, [applyTicketState, email]);

  useEffect(() => {
    if (!isOpen || !email) return undefined;

    refreshFromApi();
    refreshNotifications();

    const token = getSessionToken();
    void connectSupportSocket({
      role: 'user',
      email,
      token,
      handlers: {
        onTicket: (ticket) => {
          if ((ticket.email ?? '').toLowerCase() === email.toLowerCase()) {
            applyTicketState(ticket);
            refreshNotifications();
          }
        },
      },
    });
  }, [isOpen, email, applyTicketState, refreshFromApi, refreshNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, isOpen, isBotTyping]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (event) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text || !email || isSending) return;

    setIsSending(true);
    setIsBotTyping(true);
    setLoadError(null);

    try {
      const token = getSessionToken();
      const result = await sendSupportMessage({
        text,
        name: displayName,
        token,
      });

      setDraft('');
      applyTicketState(result.ticket);

      if (result.handoff) {
        setWaitingForAdmin(true);
        refreshNotifications();
        return;
      }

      if (result.pendingAi) {
        const storeData = loadSupportStoreContext(email);
        const reply = await generateBotResponse(text, storeData);
        const botResult = await saveSupportBotReply({
          ticketId: result.ticket.id,
          text: reply,
          token,
        });
        applyTicketState(botResult.ticket);
      }

      refreshNotifications();
    } catch (error) {
      console.error('[SupportChatWidget] send failed:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsBotTyping(false);
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-[60] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,8,24,0.25)] dark:border-white/10 dark:bg-[#150d22] md:bottom-8 md:right-8"
      role="dialog"
      aria-modal="true"
      aria-label="AI Fashion Support chat"
    >
      <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-magenta/10 to-violet/10 px-4 py-3 dark:border-white/5">
        <div className="min-w-0">
          <h2 className="truncate font-playfair text-base font-semibold text-slate-900 dark:text-white">
            AI Fashion Support
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-60',
                  waitingForAdmin ? 'animate-ping bg-amber-400' : 'animate-ping bg-emerald-400',
                )}
              />
              <span
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  waitingForAdmin ? 'bg-amber-500' : 'bg-emerald-500',
                )}
              />
            </span>
            {waitingForAdmin ? 'Waiting for Admin…' : 'Online'}
          </p>
        </div>
        <button
          type="button"
          onClick={closeChat}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Close support chat"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {waitingForAdmin && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:text-amber-200">
          Waiting for Admin — a human agent has been notified.
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex min-h-[280px] max-h-[min(52dvh,420px)] flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/80 px-4 py-4 dark:bg-[#0f0818]/80"
      >
        {loadError && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">
            {loadError}
          </p>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              How can we help you today?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ask about virtual try-on, orders, or account issues. Type &quot;talk to admin&quot; for human support.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isBotTyping && <TypingBubble />}
          </>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-[#150d22]"
      >
        {!email ? (
          <p className="px-1 py-2 text-center text-xs text-slate-500">Sign in to send a message.</p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend(event);
                }
              }}
              rows={2}
              placeholder={waitingForAdmin ? 'Waiting for admin — you can still send updates…' : 'Type your message…'}
              className="max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/20 dark:border-white/10 dark:bg-[#0f0818] dark:text-white"
            />
            <button
              type="submit"
              disabled={isSending || isBotTyping || !draft.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-magenta text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
