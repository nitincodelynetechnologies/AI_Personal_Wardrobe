# Phase 4 — Style Studio UI

Interactive outfit recommendations page at `/outfits`.

## Route

- `/outfits` — Style Studio (AI outfit generation + saved looks)

## Features

- Fetches saved outfits via `GET /api/outfits`
- Generates new outfits via `POST /api/outfits/generate`
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `OutfitCard` stacks top, bottom, and footwear images like a real outfit
- Gradient **Generate New Outfit** CTA with AI loading overlay
- Empty state: "You have no outfits yet. Let AI build your first look!"
- Toast on success; `400` shows **Upload more clothes first!**

## Structure

```
src/features/outfits/
├── components/
│   ├── StyleStudioPage.jsx
│   ├── OutfitCard.jsx
│   ├── OutfitsGrid.jsx
│   ├── OutfitsEmptyState.jsx
│   ├── OutfitsGridSkeleton.jsx
│   ├── GenerateOutfitButton.jsx
│   └── OutfitGenerationLoader.jsx
├── hooks/
│   ├── useOutfits.js
│   └── useGenerateOutfit.js
├── services/
│   └── outfitService.js
└── store/
    └── useOutfitStore.js
```

## Sidebar

**Style Studio** in `DashboardLayout` links to `/outfits` (replaces disabled Recommendations item).
