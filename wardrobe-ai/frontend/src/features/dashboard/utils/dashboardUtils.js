export const COLOR_HEX_MAP = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  navy: '#1e3a5f',
  beige: '#d4c4a8',
  burgundy: '#722f37',
  olive: '#556b2f',
  blush: '#e8b4b8',
  camel: '#c19a6b',
  grey: '#808080',
  gray: '#808080',
  emerald: '#046307',
};

export function formatLabel(value) {
  if (!value) return '—';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getUserInitials(user) {
  const source = user?.email || user?.mobile || 'User';
  const parts = source.split(/[@.\s_-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(user, profile) {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  if (user?.name?.trim()) return user.name.trim();

  const email = user?.email?.trim();
  if (email) {
    const local = email.split('@')[0] || '';
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return 'Guest';
}

export function getTopAffinities(affinityMap = {}, limit = 4) {
  return Object.entries(affinityMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, score]) => ({
      name,
      score: Math.round(score * 100),
    }));
}

export function getPrimaryStyle(fashionDna, preferences) {
  return fashionDna?.fashion_style || preferences?.fashion_style || null;
}

export function getRecentWardrobeItems(items = [], limit = 4) {
  return [...items]
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, limit);
}

export function getLatestOutfit(outfits = []) {
  if (!outfits.length) return null;

  return [...outfits].sort(
    (left, right) => new Date(right.created_at) - new Date(left.created_at),
  )[0];
}
