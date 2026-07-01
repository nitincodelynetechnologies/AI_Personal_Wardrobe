export const SUPPORT_FAQS_KEY = 'vton_support_faqs';

export const DEFAULT_SUPPORT_FAQS = [
  {
    id: 'shipping',
    question: 'How long does shipping take?',
    answer:
      'Standard delivery is 5–7 business days across India. Express (2–3 days) is available at checkout for select pin codes.',
    keywords: ['shipping', 'delivery', 'ship', 'arrive', 'when will', 'how long'],
  },
  {
    id: 'returns',
    question: 'What is your return policy?',
    answer:
      'Unworn items with tags attached can be returned within 14 days. Open Settings → Order History to start a return on eligible orders.',
    keywords: ['return', 'refund', 'exchange', 'money back'],
  },
  {
    id: 'try-on',
    question: 'How does virtual try-on work?',
    answer:
      'Open any product in the Catalog, tap Virtual Try-On, and choose Basic 2D or Premium 3D avatar. Premium uses your Face Studio scan for a personalized fit preview.',
    keywords: ['try on', 'try-on', 'virtual', 'vton', 'fitting', 'avatar', '3d'],
  },
  {
    id: 'face-studio',
    question: 'What is Face Studio?',
    answer:
      'Face Studio captures your face shape and skin tone so our AI can recommend colors and power Premium 3D try-on. Find it in the main navigation after sign-in.',
    keywords: ['face studio', 'face scan', 'biometric', 'skin tone'],
  },
  {
    id: 'payment',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) on orders under ₹10,000.',
    keywords: ['payment', 'pay', 'upi', 'card', 'cod', 'cash on delivery'],
  },
  {
    id: 'account',
    question: 'How do I update my profile or preferences?',
    answer:
      'Go to Settings to update your profile, style preferences, and order history. Fashion DNA updates automatically as you save looks and shop.',
    keywords: ['account', 'profile', 'settings', 'password', 'email', 'preferences'],
  },
];

function safeRead(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** FAQs from localStorage, falling back to defaults. */
export function readSupportFaqs() {
  const raw = safeRead(SUPPORT_FAQS_KEY);
  if (!raw) return DEFAULT_SUPPORT_FAQS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SUPPORT_FAQS;
    return parsed.map((faq, index) => ({
      id: faq.id ?? `faq-${index}`,
      question: String(faq.question ?? '').trim(),
      answer: String(faq.answer ?? '').trim(),
      keywords: Array.isArray(faq.keywords) ? faq.keywords : [],
    })).filter((faq) => faq.question && faq.answer);
  } catch {
    return DEFAULT_SUPPORT_FAQS;
  }
}
