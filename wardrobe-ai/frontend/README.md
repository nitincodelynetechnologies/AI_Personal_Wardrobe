# AI Personal Wardrobe & Virtual Fashion Platform

Next.js 15 frontend for an AI-powered personal wardrobe with biometric face registration.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript (no TypeScript)
- **UI:** ShadCN UI + Tailwind CSS
- **State:** Zustand (global), TanStack Query (API)
- **Forms / Validation:** React Hook Form + Zod

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs on **http://localhost:3002** (port 3000 is avoided since the API uses 3001).

## Face Registration

Navigate to `/register/face` or click **Start Face Registration** on the home page.

See [src/features/auth/README.md](src/features/auth/README.md) for full feature documentation.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run lint` | ESLint                   |
| `npm run format` | Prettier               |
