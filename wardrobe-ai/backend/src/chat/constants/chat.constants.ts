export const CHAT_MIN_DELAY_MS = 1000;
export const CHAT_MAX_DELAY_MS = 2000;

export const CHAT_GREETING =
  'Hello! I am your personal AI Stylist. How can I elevate your look today?';

export const CHAT_RESPONSES = {
  interview: `For a formal interview, I recommend a tailored navy blue suit paired with a crisp white shirt and leather oxford shoes. Keep accessories minimal — a slim leather belt and a subtle watch signal confidence without distraction.

Would you like me to find matching pieces under ₹5,000 in your catalog?`,

  wedding: `For wedding celebrations, consider an elevated ethnic or fusion look: a deep emerald or midnight blue bandhgala with tailored trousers, or a flowing silk saree in champagne gold with statement earrings.

**Palette:** Emerald · Champagne · Ivory · Antique Gold

Shall I curate a complete wedding guest outfit from the catalog?`,

  budget: `Here is a polished look under ₹5,000:

• **Top:** Minimal linen shirt (₹2,499) — breathable, office-to-evening
• **Bottom:** Tailored wide trousers (₹2,999) — elongates silhouette
• **Footwear:** Classic white sneakers you may already own

**Palette:** Sand · Oat · Soft White · Navy accent

Total estimate: ~₹5,498 — swap sneakers to hit ₹5,000 exactly. Want me to add these to your bag?`,

  general: `I'd love to help refine your look. You can ask me about:

• Interview or office-ready outfits
• Wedding and festive styling
• Budget-friendly combinations under ₹5,000
• Color palettes that complement your skin tone

What occasion are you dressing for?`,
} as const;

export type ChatIntent = keyof typeof CHAT_RESPONSES;
