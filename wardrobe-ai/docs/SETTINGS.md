# Phase 7 — Wardrobe Management & User Settings

Full delete support for wardrobe items and outfits, plus a dedicated Settings page for profile and style preferences.

## Backend endpoints

All routes require `Authorization: Bearer <jwt_token>`.

| Method | Path | Description |
|--------|------|-------------|
| DELETE | `/api/wardrobe/items/:id` | Delete clothing item, Qdrant vector, image file |
| DELETE | `/api/outfits/:id` | Delete a saved outfit |
| PUT | `/api/profile/preferences` | Update style preferences (existing) |
| PUT | `/api/profile` | Update profile demographics (existing) |

**Swagger:** http://localhost:3001/api/docs

## DELETE /api/wardrobe/items/:id

### Cascade behavior

1. Deletes outfits that would become invalid after the clothing item is removed (PostgreSQL `outfits_has_item_chk`)
2. Deletes the clothing row (remaining outfit FKs are set to `NULL` via `ON DELETE SET NULL`)
3. Removes the Qdrant vector for the item
4. Deletes the uploaded image file from disk

### Response

```json
{
  "success": true,
  "deleted_outfit_ids": ["uuid", "uuid"]
}
```

## DELETE /api/outfits/:id

```json
{ "success": true }
```

## Frontend routes

| Route | Description |
|-------|-------------|
| `/settings` | User Settings (Profile + Style Preferences tabs) |
| `/wardrobe` | Wardrobe grid with delete confirmation |
| `/outfits` | Style Studio with outfit delete + feedback |

## Delete UX

- Trash icon on wardrobe cards and outfit cards
- ShadCN `AlertDialog` confirmation: *"Are you sure you want to delete this item? This action cannot be undone."*
- Optimistic Zustand removal + success toast
- Query cache invalidation on failure

## Settings page

**My Profile tab:** Age, Height (cm), Weight (kg) → `PUT /api/profile`

**Style Preferences tab:** Favorite colors, Budget slider → `PUT /api/profile/preferences`

Forms are pre-filled from `GET /api/profile` and update the global `useProfileStore` on save.

## Module structure

```
frontend/src/features/settings/
├── components/
│   ├── SettingsPage.jsx
│   ├── SettingsProfileForm.jsx
│   └── SettingsPreferencesForm.jsx
└── validations/
    └── settingsSchema.js

frontend/src/components/shared/
└── DeleteConfirmationDialog.jsx
```
