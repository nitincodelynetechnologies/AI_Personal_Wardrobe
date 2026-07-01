export const OPEN_STYLIST_CHAT_EVENT = 'open-stylist-chat';
export const OPEN_STYLIST_CHAT_PENDING_KEY = 'wardrobe-open-stylist-chat';

export function requestOpenStylistChat() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_STYLIST_CHAT_EVENT));
}

export function queueOpenStylistChatAfterNavigation() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(OPEN_STYLIST_CHAT_PENDING_KEY, '1');
  } catch {
    // Ignore private browsing / quota errors.
  }
}

export function consumePendingStylistChatOpen() {
  if (typeof window === 'undefined') return false;

  try {
    const pending = sessionStorage.getItem(OPEN_STYLIST_CHAT_PENDING_KEY) === '1';
    if (pending) sessionStorage.removeItem(OPEN_STYLIST_CHAT_PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}
