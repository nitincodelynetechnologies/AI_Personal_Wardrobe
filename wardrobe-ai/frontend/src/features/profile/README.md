# Phase 2 — User Onboarding UI

Multi-step onboarding flow for demographics and fashion preferences.

## Route

- `/onboarding` — primary onboarding flow after face auth
- `/profile/settings` — re-opens onboarding form

## Flow

1. User completes face registration or login (JWT stored in `useAuthStore`)
2. Redirect to `/onboarding`
3. **Step 1 — Demographics:** gender, age, height, weight, body type, skin tone
4. **Step 2 — Style preferences:** colors, brands, budget slider, fashion style
5. Submit → `PUT /api/profile` + `PUT /api/profile/preferences`
6. Loading state → redirect to `/dashboard`

## API Integration

| Action | Endpoint | Service |
|--------|----------|---------|
| Load profile | `GET /api/profile` | `getProfile()` |
| Save demographics | `PUT /api/profile` | `updateProfile()` |
| Save preferences + Fashion DNA | `PUT /api/profile/preferences` | `updatePreferences()` |
| Full onboarding submit | Both above | `submitOnboarding()` |

All requests send `Authorization: Bearer <accessToken>`.

## State

`useProfileStore` (Zustand + persist):

- `profile`, `preferences`, `fashionDna`
- `onboardingComplete` — gates dashboard access

## Components

| File | Lines | Role |
|------|-------|------|
| `MultiStepOnboarding.jsx` | ~195 | Step orchestration + submit |
| `DemographicsForm.jsx` | ~130 | Step 1 fields |
| `PreferencesForm.jsx` | ~95 | Step 2 fields |
| `OnboardingStepper.jsx` | ~55 | Progress indicator |
| `FashionDnaLoader.jsx` | ~25 | Submit loading UI |

## Local Development

```bash
cd wardrobe-ai/frontend
npm run dev
```

Open http://localhost:3003/onboarding (requires JWT from face login/register).
