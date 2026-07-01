import { DEFAULT_GARMENTS } from '@/features/catalog/constants/catalogProducts';
import { formatCatalogPrice } from '@/features/catalog/constants/catalogOptions';
import { readGlobalCatalog, GLOBAL_CATALOG_KEY } from '@/features/catalog/utils/globalCatalogStorage';
import { PRODUCTS_KEY } from '@/features/admin/utils/adminDashboardAnalytics';
import {
  ORDERS_KEY,
  readOrders,
  readOrdersForEmail,
} from '@/features/shared/storage/platformSyncStorage';
import { readSupportFaqs, SUPPORT_FAQS_KEY } from '@/features/support/constants/supportFaqs';

export const SUPPORT_SYSTEM_PROMPT = `You are the smart customer support AI for our fashion store. Use the provided product catalog and order data to answer the user. Be polite, concise, and helpful. If they ask about an order, ask for their email.`;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const THINKING_DELAY_MS = { min: 400, max: 900 };

function safeRead(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseJsonArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return null;

  const name = String(product.name ?? '').trim();
  if (!name) return null;

  return {
    id: product.id != null ? String(product.id) : null,
    name,
    brand: product.brand ?? 'Wardrobe AI',
    category: product.category ?? product.type ?? 'General',
    price: Number(product.price) || 0,
    stockStatus: product.stockStatus ?? 'In Stock',
  };
}

function readCatalogProducts() {
  const merged = [];
  const seen = new Set();

  const sources = [
    ...parseJsonArray(safeRead(PRODUCTS_KEY)),
    ...readGlobalCatalog(),
    ...DEFAULT_GARMENTS,
  ];

  for (const entry of sources) {
    const normalized = normalizeProduct(entry);
    if (!normalized) continue;

    const key = normalized.id ?? normalized.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(normalized);
  }

  return merged;
}

/** Load products, orders, and FAQs from localStorage for context injection. */
export function loadSupportStoreContext(userEmail) {
  const normalizedEmail = (userEmail ?? '').trim().toLowerCase();

  return {
    products: readCatalogProducts(),
    orders: readOrders(),
    userOrders: readOrdersForEmail(normalizedEmail),
    faqs: readSupportFaqs(),
    userEmail: normalizedEmail,
    storageKeys: {
      products: PRODUCTS_KEY,
      globalCatalog: GLOBAL_CATALOG_KEY,
      orders: ORDERS_KEY,
      faqs: SUPPORT_FAQS_KEY,
    },
  };
}

function buildContextBlock(storeData) {
  const { products, orders, userOrders, faqs, userEmail } = storeData;

  const productLines = products.slice(0, 40).map((product) => {
    const stock = product.stockStatus ? ` · ${product.stockStatus}` : '';
    return `- ${product.name} (${product.category}) — ${formatCatalogPrice(product.price)}${stock}`;
  });

  const orderLines = orders.slice(0, 25).map((order) => {
    const items = Array.isArray(order.products) ? order.products.join(', ') : '—';
    return `- ${order.id} · ${order.email} · ${order.status} · ${formatCatalogPrice(order.amount)} · ${items}`;
  });

  const userOrderLines = userOrders.map((order) => {
    const items = Array.isArray(order.products) ? order.products.join(', ') : '—';
    return `- ${order.id} · ${order.status} · ${formatCatalogPrice(order.amount)} · ${order.date ?? '—'} · ${items}`;
  });

  const faqLines = faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`);

  return [
    `Signed-in email: ${userEmail || '(not provided)'}`,
    '',
    `Product catalog (${products.length} items):`,
    productLines.length ? productLines.join('\n') : '- No products in catalog yet.',
    '',
    `All orders (${orders.length}):`,
    orderLines.length ? orderLines.join('\n') : '- No orders recorded yet.',
    '',
    `Orders for signed-in user (${userOrders.length}):`,
    userOrderLines.length ? userOrderLines.join('\n') : '- None on file for this account.',
    '',
    'FAQs:',
    faqLines.join('\n\n'),
  ].join('\n');
}

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0]?.toLowerCase() ?? null;
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function scoreFaqMatch(message, faq) {
  const keywords = faq.keywords?.length ? faq.keywords : [faq.question.toLowerCase()];
  let score = 0;

  for (const keyword of keywords) {
    const normalized = keyword.toLowerCase();
    if (message.includes(normalized)) score += 2;
    if (normalized.split(/\s+/).every((word) => message.includes(word))) score += 1;
  }

  return score;
}

function findBestFaq(message, faqs) {
  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = scoreFaqMatch(message, faq);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  return bestScore >= 2 ? best : null;
}

function findProductsByQuery(message, products) {
  const tokens = message
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !['the', 'and', 'for', 'what', 'how', 'any', 'our'].includes(token));

  if (!tokens.length) return [];

  return products
    .map((product) => {
      const haystack = `${product.name} ${product.category} ${product.brand}`.toLowerCase();
      const hits = tokens.filter((token) => haystack.includes(token)).length;
      return { product, hits };
    })
    .filter(({ hits }) => hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5)
    .map(({ product }) => product);
}

function formatOrderSummary(order) {
  const items = Array.isArray(order.products) && order.products.length
    ? order.products.join(', ')
    : `${order.items ?? 0} item(s)`;

  return `• ${order.id} — ${order.status} — ${formatCatalogPrice(order.amount)} — ${items} (${order.date ?? 'date pending'})`;
}

function generateKeywordResponse(userMessage, storeData) {
  const message = userMessage.trim().toLowerCase();
  const { products, orders, userOrders, faqs, userEmail } = storeData;

  if (!message) {
    return 'Please type a message and I’ll be happy to help.';
  }

  if (includesAny(message, ['hello', 'hi ', 'hey', 'good morning', 'good evening', 'namaste'])) {
    const nameHint = userEmail ? ` I see you’re signed in as ${userEmail}.` : '';
    return `Hello! I’m your AI Fashion Support assistant.${nameHint} Ask me about our catalog, virtual try-on, order status, or returns — I’m here to help.`;
  }

  const faqHit = findBestFaq(message, faqs);
  if (faqHit) {
    return `${faqHit.answer}\n\nIf you need more help, just ask or mention your order ID.`;
  }

  const isOrderQuery = includesAny(message, [
    'order',
    'track',
    'tracking',
    'shipment',
    'delivery status',
    'where is my',
    'order status',
  ]);

  if (isOrderQuery) {
    const emailFromMessage = extractEmail(message);
    const lookupEmail = emailFromMessage ?? userEmail;

    if (!lookupEmail) {
      return 'I can look up your order right away — please share the email address you used at checkout.';
    }

    const matchedOrders = orders.filter((order) => order.email === lookupEmail);

    if (!matchedOrders.length) {
      return `I couldn’t find any orders for ${lookupEmail}. Double-check the email or share your order ID (e.g. ORD-…) and I’ll search again.`;
    }

    const lines = matchedOrders.slice(0, 5).map(formatOrderSummary);
    const more = matchedOrders.length > 5 ? `\n\n…and ${matchedOrders.length - 5} more order(s) on file.` : '';

    return `Here ${matchedOrders.length === 1 ? 'is your order' : `are your ${matchedOrders.length} orders`} for ${lookupEmail}:\n\n${lines.join('\n')}${more}\n\nNeed an update on a specific ID? Reply with the order number.`;
  }

  const isTryOnQuery = includesAny(message, [
    'try on',
    'try-on',
    'virtual try',
    'fitting room',
    'vton',
    '3d avatar',
    'premium avatar',
  ]);

  if (isTryOnQuery) {
    const inStock = products.filter((p) => p.stockStatus !== 'Out of Stock').length;
    return `Virtual Try-On is available on catalog items — tap Virtual Try-On on any product card.\n\n• Basic 2D — instant static preview\n• Premium 3D — WebGL avatar (use Face Studio for best results)\n\nWe currently have ${inStock || products.length} item(s) ready to try. Open Catalog to start.`;
  }

  const isCatalogQuery = includesAny(message, [
    'price',
    'cost',
    'how much',
    'catalog',
    'inventory',
    'stock',
    'available',
    'sell',
    'product',
    'dress',
    'shirt',
    'jacket',
    'shoe',
    'collection',
  ]);

  if (isCatalogQuery) {
    const matches = findProductsByQuery(message, products);

    if (matches.length) {
      const lines = matches.map(
        (product) =>
          `• ${product.name} (${product.category}) — ${formatCatalogPrice(product.price)}${product.stockStatus ? ` · ${product.stockStatus}` : ''}`,
      );
      return `Here’s what I found in our catalog:\n\n${lines.join('\n')}\n\nOpen Catalog to try these on virtually or add to cart.`;
    }

    if (!products.length) {
      return 'Our catalog is being updated — check back shortly or browse **Catalog** for the latest arrivals.';
    }

    const categories = [...new Set(products.map((p) => p.category))].slice(0, 6);
    const sample = products.slice(0, 4).map(
      (product) => `• ${product.name} — ${formatCatalogPrice(product.price)}`,
    );

    return `We carry ${products.length} items across ${categories.join(', ')}.\n\nHighlights:\n${sample.join('\n')}\n\nTell me a style (e.g. “linen shirt” or “dresses under ₹3000”) and I’ll narrow it down.`;
  }

  if (includesAny(message, ['coupon', 'promo', 'discount', 'code'])) {
    return 'Active promo codes appear on your Dashboard when available. Apply them at checkout — only one coupon can be active at a time.';
  }

  if (userOrders.length && includesAny(message, ['my order', 'my purchase', 'recent order'])) {
    const lines = userOrders.slice(0, 3).map(formatOrderSummary);
    return `Your recent orders:\n\n${lines.join('\n')}\n\nReply with an order ID for full details.`;
  }

  return `Thanks for reaching out! I can help with:\n\n• Orders — status & tracking (share your checkout email)\n• Catalog — prices, stock & recommendations\n• Virtual Try-On — how to preview outfits in 3D\n• Returns & shipping — policy & timelines\n\nWhat would you like to know?`;
}

async function generateOpenAIResponse(userMessage, storeData, apiKey) {
  const contextBlock = buildContextBlock(storeData);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `${SUPPORT_SYSTEM_PROMPT}\n\n--- STORE CONTEXT ---\n${contextBlock}`,
        },
        { role: 'user', content: userMessage.trim() },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('OpenAI returned an empty response');
  }

  return reply;
}

function simulateThinkingDelay() {
  const ms =
    THINKING_DELAY_MS.min +
    Math.floor(Math.random() * (THINKING_DELAY_MS.max - THINKING_DELAY_MS.min + 1));

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Generate a context-aware support reply.
 * Uses OpenAI when NEXT_PUBLIC_SUPPORT_OPENAI_API_KEY is set; otherwise keyword engine.
 *
 * @param {string} userMessage
 * @param {ReturnType<typeof loadSupportStoreContext>} storeData
 */
export async function generateBotResponse(userMessage, storeData) {
  const apiKey = process.env.NEXT_PUBLIC_SUPPORT_OPENAI_API_KEY;

  const [reply] = await Promise.all([
    (async () => {
      if (apiKey?.trim()) {
        try {
          return await generateOpenAIResponse(userMessage, storeData, apiKey);
        } catch (error) {
          console.warn('[chatService] OpenAI unavailable, using keyword engine:', error);
        }
      }
      return generateKeywordResponse(userMessage, storeData);
    })(),
    simulateThinkingDelay(),
  ]);

  return reply;
}
