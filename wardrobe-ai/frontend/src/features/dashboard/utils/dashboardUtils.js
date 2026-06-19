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
  const source = user?.email || user?.mobile || 'U';
  const letter = source.trim().charAt(0).toUpperCase();
  return letter || 'U';
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
