# Phase 1 — Authentication API

Face registration and face login endpoints for the AI Personal Wardrobe Platform.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/face-register` | Register user + store face embedding |
| POST | `/api/auth/face-login` | Login via face similarity search |
| GET | `/api/health` | Service health check |

**Swagger UI:** http://localhost:3001/api/docs

## Face Registration

`POST /api/auth/face-register` — `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `email` | email or mobile | User email |
| `mobile` | email or mobile | User mobile |
| `password` | yes | Min 8 characters |
| `name` | no | Stored in Qdrant payload |
| `avatar_url` | no | Stored in Qdrant payload |
| `front` | yes | Face image (JPEG/PNG) |
| `left` | yes | Left profile image |
| `right` | yes | Right profile image |
| `smile` | yes | Smile capture image |

**Flow:**
1. Validate DTO + images
2. Insert user into `wardrobe.users` (PostgreSQL)
3. Generate 512-dim embedding via Face Service (mocked)
4. Upsert vector into `users_face_vectors` (Qdrant)
5. Return JWT + user object

## Face Login

`POST /api/auth/face-login` — `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `face` | yes | Face image for matching |

**Flow:**
1. Generate embedding from face image
2. Similarity search in Qdrant (threshold: `QDRANT_SIMILARITY_THRESHOLD`)
3. Verify user exists and is `active` in PostgreSQL
4. Return JWT + user object

> **Mock mode:** Login matches when the same `front` registration image is used as the `face` login image.

## Environment Variables

```env
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
FACE_SERVICE_URL=http://localhost:8000
FACE_SERVICE_MOCK=false
FACE_SERVICE_TIMEOUT_MS=15000
QDRANT_SIMILARITY_THRESHOLD=0.55
FACE_LOGIN_SIMILARITY_THRESHOLD=0.55
```

Set `FACE_SERVICE_MOCK=false` to call the real Python FastAPI service at `FACE_SERVICE_URL/v1/face/embed`.

## Start Backend

```bash
cd backend
npm install
npm run start:dev
```

## Example (curl)

```bash
# Register
curl -X POST http://localhost:3001/api/auth/face-register \
  -F "email=user@example.com" \
  -F "password=SecurePass123!" \
  -F "name=Jane Doe" \
  -F "front=@./front.jpg" \
  -F "left=@./left.jpg" \
  -F "right=@./right.jpg" \
  -F "smile=@./smile.jpg"

# Login (use same image as front.jpg for mock match)
curl -X POST http://localhost:3001/api/auth/face-login \
  -F "face=@./front.jpg"
```
