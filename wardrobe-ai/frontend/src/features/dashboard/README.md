# Phase 2 — Main Dashboard

High-tech homepage displaying Fashion DNA, profile badges, and Phase 3/4 placeholders.

## Route

`/dashboard` — requires JWT + completed onboarding

## Data flow

1. Auth guard redirects unauthenticated users to `/login/face`
2. Incomplete onboarding redirects to `/onboarding`
3. `useDashboard()` fetches `GET /api/profile` + `GET /api/fashion-dna`
4. Results sync to `useProfileStore` and render dashboard cards

## Components

| Component | Role |
|-----------|------|
| `DashboardLayout.jsx` | Sidebar shell (desktop) + mobile header |
| `DashboardPage.jsx` | Page orchestrator + auth guards |
| `DashboardGreeting.jsx` | Avatar initials + personalized greeting |
| `FashionDNACard.jsx` | Style scores, color/brand affinity, missing state |
| `RadialScore.jsx` | SVG radial progress for scores |
| `EmptyWardrobeState.jsx` | Phase 3 placeholder |
| `EmptyRecommendationsState.jsx` | Phase 4 placeholder |
| `DashboardSkeleton.jsx` | Loading skeleton |

## API

| Endpoint | Service |
|----------|---------|
| `GET /api/profile` | `fetchDashboardData()` |
| `GET /api/fashion-dna` | `fetchDashboardData()` (404 → null) |

## Local dev

```bash
cd wardrobe-ai/frontend
npm run dev
```

Open http://localhost:3003/dashboard after face login + onboarding.
