export const HUMAN_HANDOFF_REPLY =
  'Please wait, an admin has been notified and will join the chat shortly.';

export const HUMAN_HANDOFF_WAITING_REPLY =
  'You are still in the queue for a human agent. An admin will respond as soon as possible.';

export const HUMAN_HANDOFF_KEYWORDS = [
  'support agent',
  'customer service',
  'live support',
  'live agent',
  'real person',
  'real human',
  'talk to admin',
  'talk admin',
  'speak to admin',
  'connect to admin',
  'need admin',
  'want admin',
  'human agent',
  'human support',
] as const;

export const HUMAN_HANDOFF_TRIGGERS = ['admin', 'human', 'agent', 'representative', 'operator'] as const;

export const HUMAN_HANDOFF_INTENTS = [
  'talk',
  'speak',
  'chat',
  'connect',
  'want',
  'need',
  'transfer',
  'escalat',
  'help me',
] as const;

export function wantsHumanHandoff(message: string): boolean {
  const text = message.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return false;

  if (HUMAN_HANDOFF_KEYWORDS.some((phrase) => text.includes(phrase))) {
    return true;
  }

  const hasTrigger = HUMAN_HANDOFF_TRIGGERS.some((word) => text.includes(word));
  const hasIntent = HUMAN_HANDOFF_INTENTS.some((word) => text.includes(word));

  if (hasTrigger && hasIntent) {
    return true;
  }

  if (text === 'human' || text === 'admin' || text === 'agent') {
    return true;
  }

  return false;
}
