# Phase 3 — Digital Wardrobe UI

Responsive wardrobe gallery with drag-and-drop upload modal.

## Route

| Path | Component |
|------|-----------|
| `/wardrobe` | `WardrobePage` |

## API integration

| Action | Service | Endpoint |
|--------|---------|----------|
| List items | `fetchWardrobeItems()` | `GET /api/wardrobe/items` |
| Upload item | `uploadWardrobeItem()` | `POST /api/wardrobe/upload` |

## State

- **Zustand:** `useWardrobeStore` — `items`, `categoryFilter`, `addItem`
- **React Query:** `useWardrobe()` — fetches and syncs items on load

## Components

```
src/features/wardrobe/components/
├── WardrobePage.jsx       # Page shell + auth guards
├── WardrobeGrid.jsx       # Responsive card grid
├── WardrobeItemCard.jsx   # Single clothing card
├── WardrobeFilters.jsx    # Category pill filters
├── WardrobeGridSkeleton.jsx
├── WardrobeEmptyState.jsx
└── UploadItemModal.jsx    # Drag-drop upload + metadata form
```

## Run locally

```powershell
cd wardrobe-ai/frontend
npm run dev
```

Navigate to http://localhost:3003/wardrobe after logging in and completing onboarding.
