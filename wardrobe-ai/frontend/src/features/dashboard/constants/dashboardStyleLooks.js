export const CURATION_FILTERS = [
  { id: 'best-match', label: 'Best Match' },
  { id: 'style-journey', label: 'Style Journey' },
  { id: 'colour-affinity', label: 'Colour Affinity' },
  { id: 'occasion', label: 'Occasion' },
];

export const STYLE_LOOK_META = [
  { category: 'OFFICE FORMAL', styleName: 'Sharp Tailored', matchScore: 97 },
  { category: 'EVERYDAY', styleName: 'Urban Minimal', matchScore: 94 },
  { category: 'SMART CASUAL', styleName: 'Relaxed Edge', matchScore: 91 },
  { category: 'WEEKEND', styleName: 'Modern Classic', matchScore: 88 },
];

export const TRENDING_LOOKS = [
  {
    id: 'trend-1',
    styleName: 'Quiet Luxury',
    category: 'TRENDING',
    matchScore: 96,
    image_url:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'trend-2',
    styleName: 'Soft Structure',
    category: 'TRENDING',
    matchScore: 93,
    image_url:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'trend-3',
    styleName: 'Neo Tailoring',
    category: 'TRENDING',
    matchScore: 90,
    image_url:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'trend-4',
    styleName: 'Elevated Basics',
    category: 'TRENDING',
    matchScore: 87,
    image_url:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
  },
];

export function enrichProductWithLook(product, index = 0) {
  const meta = STYLE_LOOK_META[index % STYLE_LOOK_META.length];

  return {
    ...product,
    lookCategory: meta.category,
    styleName: meta.styleName,
    matchScore: Math.max(82, meta.matchScore - Math.floor(index / STYLE_LOOK_META.length) * 2),
  };
}
