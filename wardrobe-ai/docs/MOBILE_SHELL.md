# Phase 8 — Mobile Polish & App Shell

Native-app-like mobile experience with bottom navigation, theme switching, and safe-area support.

## App shell

| Component | Path | Role |
|-----------|------|------|
| `AppLayout` | `src/components/layout/AppLayout.jsx` | Desktop sidebar + mobile header + main content |
| `BottomNav` | `src/components/layout/BottomNav.jsx` | Fixed mobile bottom nav (`md:hidden`) |
| `nav-items.js` | `src/components/layout/nav-items.js` | Shared nav config |

`DashboardLayout` re-exports `AppLayout` for backward compatibility.

## Mobile bottom navigation

Visible below `md` breakpoint with icons for:

- Dashboard (`/dashboard`)
- Wardrobe (`/wardrobe`)
- Style Studio (`/outfits`)
- Settings (`/settings`)

Active route uses `bg-primary/15` pill + primary icon color.

## Safe areas

- Main content uses `.app-main` utility: `padding-bottom: calc(5.5rem + env(safe-area-inset-bottom))`
- Bottom nav respects `env(safe-area-inset-bottom)`
- Root layout sets `viewportFit: 'cover'` for notched devices

## Theme

- `next-themes` via `ThemeProvider` in `providers.jsx`
- Toggle: `ThemeToggle` in mobile header, desktop sidebar, and Settings → Appearance
- Light/dark CSS variables in `globals.css` (`:root` + `.dark`)

Default theme: **dark** (matches original brand).

## Responsive grids

| Grid | Mobile | Tablet+ |
|------|--------|---------|
| `WardrobeGrid` | 2 columns | 4 columns (`md:`) |
| `OutfitsGrid` | 1 column | 2 columns (`sm:`), 3 (`lg:`) |
