import {
  RECOMMENDATION_CATALOG,
  RECOMMENDATION_TYPES,
} from '@/features/recommendations/constants/recommendationCatalog';

const BODY_TYPE_ALIASES = {
  athletic: ['athletic', 'slim'],
  slim: ['slim', 'athletic'],
  regular: ['regular', 'athletic'],
  curvy: ['regular', 'slim'],
};

function getProductKey(product) {
  return String(product?.id ?? product?.sku ?? product?.name ?? '');
}

function dedupeById(products = []) {
  const seen = new Set();

  return products.filter((product) => {
    const key = getProductKey(product);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizePool(catalogProducts = []) {
  if (!catalogProducts.length) return RECOMMENDATION_CATALOG;

  return dedupeById(
    catalogProducts.map((product) => {
      const seed = RECOMMENDATION_CATALOG.find(
        (item) => item.id === product.id || item.sku === product.sku,
      );

      return {
        ...seed,
        ...product,
        id: product.id ?? seed?.id ?? product.sku,
        fit_profile: seed?.fit_profile ?? ['athletic', 'slim'],
        color_family: seed?.color_family ?? ['black', 'navy'],
        style_tags: product.style_tags ?? seed?.style_tags ?? [],
      };
    }),
  );
}

function matchesBodyType(product, bodyType) {
  const profiles = BODY_TYPE_ALIASES[bodyType?.toLowerCase()] ?? BODY_TYPE_ALIASES.athletic;
  return (
    product.fit_profile?.includes('all') ||
    product.fit_profile?.some((fit) => profiles.includes(fit)) ||
    product.category === 'Men' ||
    product.category === 'Women'
  );
}

function matchesColorPalette(product, colors = []) {
  const palette = colors.map((color) => color.toLowerCase());
  const families = (product.color_family ?? []).map((color) => color.toLowerCase());
  const tags = (product.style_tags ?? []).map((tag) => tag.toLowerCase());

  return palette.some(
    (color) =>
      families.includes(color) ||
      tags.includes(color) ||
      product.name.toLowerCase().includes(color),
  );
}

function getBodyRecommendations(pool, bodyType, limit = 5) {
  const ranked = pool
    .filter((product) => ['Men', 'Women'].includes(product.category))
    .filter((product) => matchesBodyType(product, bodyType))
    .sort((a, b) => {
      const aScore = a.style_tags?.includes('tailored') ? 2 : 1;
      const bScore = b.style_tags?.includes('tailored') ? 2 : 1;
      return bScore - aScore;
    });

  return dedupeById(ranked).slice(0, limit);
}

function getColorRecommendations(pool, colors, limit = 5) {
  const ranked = pool
    .filter((product) => matchesColorPalette(product, colors))
    .sort((a, b) => Number(b.price) - Number(a.price));

  if (ranked.length >= limit) return dedupeById(ranked).slice(0, limit);

  const rankedKeys = new Set(ranked.map(getProductKey));
  const fallback = pool.filter(
    (product) =>
      !rankedKeys.has(getProductKey(product)) &&
      product.style_tags?.some((tag) =>
        ['minimalist', 'neutral', 'monochrome'].includes(tag),
      ),
  );

  return dedupeById([...ranked, ...fallback]).slice(0, limit);
}

function getCompleteLookRecommendations(pool, context, limit = 5) {
  const closetIds = new Set((context.closetProductIds ?? []).map(String));
  const wishlistIds = new Set((context.wishlistProductIds ?? []).map(String));
  const hasClosetSignal = closetIds.size > 0 || wishlistIds.size > 0;

  const complementary = pool.filter((product) => {
    if (!['Footwear', 'Accessories'].includes(product.category)) return false;
    if (wishlistIds.has(String(product.id))) return false;
    return true;
  });

  if (!hasClosetSignal) {
    return dedupeById(complementary).slice(0, limit);
  }

  const scored = complementary.map((product) => {
    let score = 0;
    if (product.category === 'Footwear') score += 2;
    if (product.color_family?.some((color) => ['black', 'navy', 'olive'].includes(color))) {
      score += 2;
    }
    if (product.style_tags?.includes('minimal')) score += 1;
    return { product, score };
  });

  return dedupeById(
    scored
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product),
  ).slice(0, limit);
}

function getStyleRecommendations(pool, fashionStyle, limit = 5) {
  const normalized = fashionStyle?.toLowerCase().replace(/\s+/g, '_') ?? 'casual';

  const STYLE_KEYWORDS = {
    casual: ['casual', 'everyday', 'comfort', 'relaxed', 'linen'],
    formal: ['formal', 'tailored', 'suit', 'blazer'],
    streetwear: ['streetwear', 'urban', 'hoodie', 'sport', 'sneaker'],
    minimalist: ['minimal', 'minimalist', 'neutral', 'monochrome'],
    bohemian: ['floral', 'summer', 'dress', 'layered', 'elegant'],
    classic: ['classic', 'tailored', 'timepiece', 'leather', 'watch'],
  };

  const keywords = STYLE_KEYWORDS[normalized] ?? [normalized.replace(/_/g, '')];

  const ranked = pool
    .map((product) => {
      const tags = (product.style_tags ?? []).map((tag) => tag.toLowerCase());
      const haystack = `${product.name} ${product.category} ${product.brand ?? ''} ${tags.join(' ')}`.toLowerCase();
      const score = keywords.reduce((total, keyword) => {
        if (tags.includes(keyword) || haystack.includes(keyword)) return total + 2;
        return total;
      }, 0);

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const matched = dedupeById(ranked.map((entry) => entry.product)).slice(0, limit);
  if (matched.length >= limit) return matched;

  const matchedKeys = new Set(matched.map(getProductKey));
  const fallback = pool.filter((product) => !matchedKeys.has(getProductKey(product)));

  return dedupeById([...matched, ...fallback]).slice(0, limit);
}

/**
 * Smart recommendation stub — filters catalog pool by section theme.
 * @param {'body'|'color'|'complete'|'style'} type
 * @param {object} context
 * @param {Array} catalogProducts
 */
export function getRecommendations(type, context = {}, catalogProducts = []) {
  const pool = normalizePool(catalogProducts);
  const bodyType = context.bodyType ?? 'athletic';
  const colors = context.preferredColors ?? ['navy', 'black', 'olive'];
  const limit = context.limit ?? 5;

  switch (type) {
    case RECOMMENDATION_TYPES.BODY:
      return getBodyRecommendations(pool, bodyType, limit);
    case RECOMMENDATION_TYPES.COLOR:
      return getColorRecommendations(pool, colors, limit);
    case RECOMMENDATION_TYPES.COMPLETE:
      return getCompleteLookRecommendations(pool, context, limit);
    case RECOMMENDATION_TYPES.STYLE:
      return getStyleRecommendations(pool, context.fashionStyle, limit);
    default:
      return dedupeById(pool).slice(0, limit);
  }
}
