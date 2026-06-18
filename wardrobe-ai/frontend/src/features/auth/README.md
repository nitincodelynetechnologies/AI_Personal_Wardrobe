# Face Registration UI & Onboarding

Secure biometric face registration flow for the AI Personal Wardrobe Platform.

## Route

`/register/face`

## Architecture

```
src/
├── app/(auth)/register/face/
│   ├── page.jsx          # App Router entry (metadata + FaceRegistrationPage)
│   ├── loading.jsx       # Suspense loading state
│   └── error.jsx         # Error boundary UI
└── features/auth/
    ├── components/       # UI components (max 300 lines each)
    ├── constants/        # Capture steps, liveness checks, limits
    ├── hooks/            # Camera, liveness, capture flow, registration
    ├── services/         # API client + face registration service
    ├── store/            # Zustand useAuthStore
    └── validations/      # Zod schemas
```

## Business Flow

1. User navigates to `/register/face`
2. Camera permission is requested with graceful fallback if denied
3. User captures **Front**, **Left**, **Right**, and **Smile** poses
4. Liveness checks run in real time (eye blink, head movement)
5. Images are sent via `POST /auth/face/register` as `FormData`
6. Backend generates a 512-D face vector and stores it in Qdrant (`users_face_vectors`)
7. On success, user is redirected to `/dashboard`

## API Integration

**Endpoint:** `POST /auth/face/register`

**Request (multipart/form-data):**

| Field            | Type   | Description                    |
|------------------|--------|--------------------------------|
| `front`          | File   | Front face capture             |
| `left`           | File   | Left profile capture           |
| `right`          | File   | Right profile capture          |
| `smile`          | File   | Smile capture                  |
| `livenessVerified` | string | `"true"` when checks pass    |
| `fullName`       | string | Optional user detail           |
| `email`          | string | Optional user detail           |

**Response:**

```json
{
  "success": true,
  "routingToken": "<secure-routing-token>",
  "user": { }
}
```

Configure the API base URL in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Validations

- Camera permission required (fallback UI on deny/unsupported)
- Zod validation on all capture blobs (type, size ≤ 10 MB)
- Multiple-face rejection via `FaceDetector` API when available
- Liveness must complete before submission

## State Management

`useAuthStore` (Zustand + persist) tracks:

- `routingToken` — secure token from registration response
- `isFaceRegistered` — completion flag
- `faceRegistrationStatus` — `idle` | `submitting` | `success` | `error`

## Components

| Component              | Responsibility                              |
|------------------------|---------------------------------------------|
| `FaceRegistrationPage` | Main orchestrator layout                    |
| `CameraViewfinder`     | Camera feed + face-alignment overlay        |
| `CaptureStepper`       | Progress for Front → Left → Right → Smile   |
| `LivenessIndicator`    | Real-time blink & head-movement feedback    |
| `RegistrationSuccess`  | Success animation + dashboard CTA           |

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3002/register/face](http://localhost:3002/register/face).

## Responsive Design

Mobile-first layout from 320px to 1920px+. Camera uses `object-cover` with mirrored preview (`scale-x-[-1]`) and aspect-ratio containers to prevent distortion. `overflow-x-hidden` is applied at root to prevent horizontal scroll.
