'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useToastStore } from '@/components/ui/toaster';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useUserAccountEmail } from '@/features/shared/hooks/useUserAccountEmail';
import {
  createSupportTicket,
  readTicketsForEmail,
  TICKETS_UPDATED,
} from '@/features/shared/storage/platformSyncStorage';

const TICKET_STATUS_STYLES = {
  Open: 'border-amber-500/40 text-amber-500 bg-amber-500/10',
  Answered: 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10',
};

export function SupportHelpPanel({ compact = false }) {
  const { displayName } = useAuthUser();
  const email = useUserAccountEmail();
  const showToast = useToastStore((state) => state.showToast);

  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(() => {
    setTickets(readTicketsForEmail(email));
  }, [email]);

  useEffect(() => {
    refresh();
    window.addEventListener(TICKETS_UPDATED, refresh);
    return () => window.removeEventListener(TICKETS_UPDATED, refresh);
  }, [refresh]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      showToast({ message: 'Sign in to submit a support ticket.', variant: 'destructive' });
      return;
    }

    if (!subject.trim() || !message.trim()) {
      showToast({ message: 'Please enter a subject and message.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      createSupportTicket({
        user: displayName || 'Guest',
        email,
        subject,
        message,
      });
      setSubject('');
      setMessage('');
      refresh();
      showToast({ message: 'Support ticket submitted. Our team will reply soon.', variant: 'success' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', compact && 'space-y-4')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="support-subject">Subject</Label>
          <Input
            id="support-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. AI image not loading"
            disabled={!email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-message">Describe your issue</Label>
          <textarea
            id="support-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={compact ? 3 : 4}
            placeholder="Tell us what happened and how we can help…"
            disabled={!email}
            className="w-full rounded-xl border border-borderColor bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/20 disabled:opacity-50 dark:border-white/10 dark:bg-[#0f0818] dark:text-white"
          />
        </div>

        <Button type="submit" disabled={isSubmitting || !email} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Ticket
            </>
          )}
        </Button>

        {!email && (
          <p className="text-xs text-muted-foreground">Sign in to contact support.</p>
        )}
      </form>

      {tickets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-magenta" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Your tickets</h3>
          </div>

          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className={cn(
                'rounded-xl border p-4',
                ticket.userUnread
                  ? 'border-magenta/30 bg-magenta/5'
                  : 'border-borderColor bg-white/40 dark:border-white/10 dark:bg-[#0f0818]/40',
              )}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-magenta">{ticket.id}</span>
                  <h4 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {ticket.subject}
                  </h4>
                  <p className="text-[10px] text-slate-500">{ticket.createdAt}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                    TICKET_STATUS_STYLES[ticket.status] ?? 'border-white/10 text-slate-400',
                  )}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="rounded-lg bg-black/5 px-3 py-2 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
                {ticket.message}
              </p>

              {ticket.adminReply && (
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Support reply
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{ticket.adminReply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
