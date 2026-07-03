export const HUMAN_HANDOFF_REPLY =
  'Please wait, an admin has been notified and will join the chat shortly.';

const HUMAN_HANDOFF_KEYWORDS = [
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
];

const HUMAN_HANDOFF_TRIGGERS = ['admin', 'human', 'agent', 'representative', 'operator'];
const HUMAN_HANDOFF_INTENTS = [
  'talk',
  'speak',
  'chat',
  'connect',
  'want',
  'need',
  'transfer',
  'escalat',
  'help me',
];

export function detectHumanHandoffRequest(message) {
  const text = (message ?? '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return false;

  if (HUMAN_HANDOFF_KEYWORDS.some((phrase) => text.includes(phrase))) {
    return true;
  }

  const hasTrigger = HUMAN_HANDOFF_TRIGGERS.some((word) => text.includes(word));
  const hasIntent = HUMAN_HANDOFF_INTENTS.some((word) => text.includes(word));

  if (hasTrigger && hasIntent) {
    return true;
  }

  return text === 'human' || text === 'admin' || text === 'agent';
}
