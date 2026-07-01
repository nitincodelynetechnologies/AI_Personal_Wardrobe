'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useUserAccountEmail } from '@/features/shared/hooks/useUserAccountEmail';
import { useSupportNotifications } from '@/features/shared/hooks/useSupportNotifications';
import {
  appendUserChatMessage,
  getChatMessagesForEmail,
  markTicketsReadForEmail,
  TICKETS_UPDATED,
  updateTicketReply,
} from '@/features/shared/storage/platformSyncStorage';
import {
  generateBotResponse,
  loadSupportStoreContext,
} from '@/features/support/services/chatService';
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
  const isAdmin = sender === 'admin';
  const timestamp = message.timestamp ?? message.at;

  return (
    <div className={cn('flex', isAdmin ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
          isAdmin
            ? 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-[#2a1a35] dark:text-slate-100'
            : 'rounded-br-md bg-magenta/15 text-slate-900 dark:bg-magenta/25 dark:text-white',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={cn(
            'mt-1 text-[10px] uppercase tracking-wider',
            isAdmin ? 'text-slate-400' : 'text-magenta/70',
          )}
        >
          {isAdmin ? 'Support · ' : 'You · '}
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
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const refreshMessages = useCallback(() => {
    setMessages(getChatMessagesForEmail(email));
  }, [email]);

  useEffect(() => {
    if (!isOpen) return;

    if (email) {
      markTicketsReadForEmail(email);
      refreshNotifications();
    }

    refreshMessages();

    const onStorage = (event) => {
      if (event.key === 'vton_tickets' || event.key === null) refreshMessages();
    };

    window.addEventListener(TICKETS_UPDATED, refreshMessages);
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(refreshMessages, 3000);

    return () => {
      window.removeEventListener(TICKETS_UPDATED, refreshMessages);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [isOpen, email, refreshMessages, refreshNotifications]);

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

    let ticket = null;

    try {
      ticket = appendUserChatMessage({ user: displayName, email, text });
      setDraft('');
      refreshMessages();

      const storeData = loadSupportStoreContext(email);
      const reply = await generateBotResponse(text, storeData);

      if (ticket?.id && reply) {
        updateTicketReply(ticket.id, reply);
      }

      refreshMessages();
      refreshNotifications();
    } catch (error) {
      console.error('[SupportChatWidget] bot reply failed:', error);

      if (ticket?.id) {
        updateTicketReply(
          ticket.id,
          'Sorry — I had trouble processing that. Please try again, or ask about orders, catalog items, or virtual try-on.',
        );
        refreshMessages();
        refreshNotifications();
      }
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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Online
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

      <div
        ref={scrollRef}
        className="flex min-h-[280px] max-h-[min(52dvh,420px)] flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/80 px-4 py-4 dark:bg-[#0f0818]/80"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              How can we help you today?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ask about virtual try-on, orders, or account issues. We typically reply within a few hours.
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
              placeholder="Type your message…"
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
