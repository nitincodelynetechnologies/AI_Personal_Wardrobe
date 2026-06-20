# AI Personal Wardrobe & Virtual Fashion Platform
## Technology Stack Reference

**Document version:** 1.0  
**Date:** June 18, 2026  
**Project:** AI Personal Wardrobe Platform (`wardrobe-ai/`)

---

## 1. Executive Summary

This platform is a **multi-service, Docker-first** application for AI-powered wardrobe management, face authentication, outfit styling, and virtual fashion experiences. It combines a modern JavaScript web stack with Python microservices for machine learning workloads, backed by PostgreSQL for relational data and Qdrant for vector search.

The architecture separates concerns deliberately: the **frontend** handles user experience, the **NestJS backend** acts as an API gateway and orchestrator, and **Python FastAPI services** run CPU/GPU-heavy AI tasks (face embeddings, clothing analysis, background removal).

---

## 2. Languages Used

| Language | Where Used | Why |
|----------|------------|-----|
| **TypeScript** | Backend (`backend/src/`) | Strong typing, NestJS ecosystem, safer API contracts, easier refactoring at scale |
| **JavaScript (JSX)** | Frontend (`frontend/src/`) | Next.js and React convention; fast iteration for UI features |
| **Python 3** | AI services (`ai-services/face-service`, `ai-services/stylist-service`) | Dominant language for ML/AI; rich libraries (InsightFace, PyTorch, rembg, OpenCV) |
| **SQL** | Database migrations & init scripts | PostgreSQL schema, indexes, and relational integrity |
| **YAML / Shell / PowerShell** | Docker Compose, deployment scripts | Infrastructure-as-code for reproducible local and containerized runs |

---

## 3. Architecture Overview

```
Browser (User)
      │
      ▼
┌─────────────────────┐
│  Frontend (Next.js) │  Port 3003 (dev) / 3000 (Docker)
└──────────┬──────────┘
           │ REST / JWT
           ▼
┌─────────────────────┐
│  Backend (NestJS)   │  Port 3001
└──┬────────┬────┬────┘
   │        │    │
   ▼        ▼    ▼
Postgres  Qdrant  Python AI Services
5432      6333    8000 (Face) / 8001 (Stylist)
```

**Design principles:**
- **Docker-first** — single `docker-compose.yml` for six core services
- **Service discovery** — internal Docker network (`wardrobe-network`)
- **Graceful degradation** — backend falls back when AI services are unavailable
- **Local-first** — no cloud dependency required for development

---

## 4. Frontend Stack

### 4.1 Core Framework

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Next.js** | 15.x | React meta-framework | App Router, SSR/SSG, API rewrites to backend, optimized image delivery, production-ready routing |
| **React** | 19.x | UI library | Component model, large ecosystem, team familiarity |
| **Tailwind CSS** | 3.4.x | Utility-first styling | Rapid UI development, consistent design tokens, small bundle with purging |

### 4.2 UI Components & Design

| Library | Purpose | Why |
|---------|---------|-----|
| **Radix UI** (`@radix-ui/react-*`) | Accessible primitives (dialogs, tabs, select, progress) | Unstyled, WAI-ARIA compliant building blocks |
| **ShadCN pattern** (CVA + clsx + tailwind-merge) | Composable UI components | Copy-paste ownership, full customization, no opaque black-box UI kit |
| **Lucide React** | Icons | Lightweight, consistent icon set |
| **next-themes** | Dark/light mode | Seamless theme switching with SSR support |

### 4.3 State & Data Fetching

| Library | Purpose | Why |
|---------|---------|-----|
| **Zustand** | Global client state (auth, wardrobe cache) | Minimal boilerplate, no Provider nesting, simple API |
| **TanStack Query (React Query)** | Server state, caching, mutations | Automatic refetch, optimistic updates, loading/error states for API calls |
| **React Hook Form** | Form handling | Performance (uncontrolled inputs), validation integration |
| **Zod** | Schema validation | Type-safe validation shared with form resolvers |

### 4.4 Face Auth (Client-Side)

| Library | Purpose | Why |
|---------|---------|-----|
| **@vladmandic/face-api** | Browser face detection | Client-side camera preview, liveness hints before server registration |
| **TensorFlow.js** (core + WebGL backend) | ML inference in browser | Hardware-accelerated face detection without server round-trips for preview |

### 4.5 Media & Performance

| Library | Purpose | Why |
|---------|---------|-----|
| **browser-image-compression** | Upload compression | Reduces payload size (~500KB, WebP, max 1024px) before upload |
| **Next.js `<Image>`** | Optimized images | Lazy loading, responsive sizes, WebP/AVIF formats |

---

## 5. Backend Stack (API Gateway)

### 5.1 Core Framework

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **NestJS** | 10.x | Node.js API framework | Modular architecture (modules/controllers/services), DI, enterprise patterns |
| **Express** (via `@nestjs/platform-express`) | — | HTTP server | Mature, multipart uploads, wide middleware support |
| **TypeScript** | 5.7.x | Language | Type safety across DTOs, services, and database layers |

### 5.2 Authentication & Security

| Library | Purpose | Why |
|---------|---------|-----|
| **@nestjs/jwt** + **Passport** + **passport-jwt** | JWT auth | Stateless sessions, standard guard pattern in NestJS |
| **bcryptjs** | Password hashing | Secure credential storage for email/password fallback |
| **class-validator** + **class-transformer** | Request validation | Decorator-based DTO validation aligned with NestJS pipes |

### 5.3 API Documentation

| Library | Purpose | Why |
|---------|---------|-----|
| **@nestjs/swagger** | OpenAPI / Swagger UI | Auto-generated docs at `/api/docs` for testing and integration |

### 5.4 Data Access

| Library | Purpose | Why |
|---------|---------|-----|
| **pg** | PostgreSQL client | Native driver, connection pooling, raw SQL for migrations |
| **@qdrant/js-client-rest** | Qdrant vector DB client | Face embedding similarity search, clothing vector storage |

### 5.5 Testing

| Library | Purpose | Why |
|---------|---------|-----|
| **Jest** + **ts-jest** | Unit/integration tests | NestJS default, fast feedback on service logic |

---

## 6. AI Services (Python Microservices)

### 6.1 Face Service (Port 8000)

**Role:** Generate 512-dimensional face embeddings for registration and login.

| Library | Purpose | Why |
|---------|---------|-----|
| **FastAPI** | HTTP API framework | Async, automatic OpenAPI, fast development |
| **Uvicorn** | ASGI server | Production-grade Python web server |
| **Pydantic** | Request/response schemas | Validation and serialization |
| **InsightFace** | Face recognition | State-of-the-art ArcFace embeddings (512-dim) |
| **ONNX Runtime** | Model inference | Efficient CPU inference for InsightFace models |
| **OpenCV (headless)** | Image preprocessing | Face alignment, resize, color conversion |
| **NumPy** + **Pillow** | Array & image handling | Standard Python imaging stack |

**Why a separate service:** Face models are heavy (~100MB+), Python has the best InsightFace support, and isolating ML keeps the NestJS gateway lightweight and restartable without reloading models.

### 6.2 Stylist Service (Port 8001)

**Role:** Clothing image analysis, outfit recommendations, background removal.

| Library | Purpose | Why |
|---------|---------|-----|
| **FastAPI** + **Uvicorn** + **Pydantic** | API layer | Same stack as face-service for consistency |
| **PyTorch** + **torchvision** | Deep learning | MobileNetV2 for category detection and 512-dim clothing embeddings |
| **scikit-learn** | K-Means clustering | Dominant color extraction from wardrobe images |
| **rembg** (U-2-Net) | Background removal | Clean product-style wardrobe photos on upload |
| **OpenCV** + **Pillow** + **NumPy** | Image processing | Preprocessing pipelines |
| **pytest** + **httpx** | Testing | Service-level API tests |

**Why PyTorch here:** Pretrained vision models (MobileNetV2) integrate naturally with torchvision; rembg depends on ONNX/PyTorch ecosystem for segmentation.

---

## 7. Databases & Storage

| Technology | Port | Role | Why |
|------------|------|------|-----|
| **PostgreSQL 15+** | 5432 | Users, wardrobe items, outfits, metadata | ACID compliance, JSON support, mature relational model |
| **Qdrant** | 6333 | Vector similarity search | Face login matching, optional clothing embeddings; purpose-built for vectors |
| **Local filesystem / Docker volume** | — | Uploaded wardrobe images | Simple MVP storage; backend serves files from `uploads/` volume |

---

## 8. DevOps & Infrastructure

| Technology | Purpose | Why |
|------------|---------|-----|
| **Docker** + **Docker Compose** | Container orchestration | Reproducible 6-service stack on any machine |
| **Multi-stage Dockerfiles** | Backend & frontend images | Smaller production images, cached build layers |
| **`.env` configuration** | Secrets & ports | Twelve-factor app pattern; never commit secrets |
| **start-platform.sh / start-platform.ps1** | One-command startup | Migrations, Qdrant init, compose up |

---

## 9. Service URLs (Local Development)

| Service | URL |
|---------|-----|
| Frontend (npm dev) | http://localhost:3003 |
| Frontend (Docker) | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Swagger UI | http://localhost:3001/api/docs |
| Face AI Service | http://localhost:8000 |
| Stylist AI Service | http://localhost:8001 |
| PostgreSQL | localhost:5432 |
| Qdrant Dashboard | http://localhost:6333 |

---

## 10. Rationale Summary

| Decision | Alternatives Considered | Why This Stack Won |
|----------|-------------------------|-------------------|
| Next.js over plain React SPA | Vite + React, Remix | Built-in routing, image optimization, API rewrites, SSR for auth flows |
| NestJS over Express raw | Fastify, Hono | Structured modules, guards, Swagger, DI — scales with feature growth |
| Python microservices for AI | Node TensorFlow.js server-side | Better ML library support (InsightFace, rembg, PyTorch) |
| PostgreSQL + Qdrant | MongoDB, Pinecone | Postgres for relational integrity; Qdrant for fast local vector search without cloud |
| Zustand + React Query | Redux, SWR | Less boilerplate; clear split between client vs server state |
| Docker Compose | Kubernetes (now) | Appropriate for local dev and MVP; K8s deferred to later phase |
| Radix + Tailwind (ShadCN) | Material UI, Chakra | Full styling control, accessibility, no heavy theme lock-in |

---

## 11. Feature-to-Technology Map

| Feature | Primary Technologies |
|---------|---------------------|
| Face registration & login | face-api.js (browser), InsightFace (server), Qdrant, JWT |
| Wardrobe upload & catalog | Next.js, NestJS, PostgreSQL, stylist-service analysis |
| Background removal | rembg + U-2-Net (stylist-service) |
| Outfit generation & feedback | NestJS outfits module, stylist recommendation engine |
| Image optimization | browser-image-compression, Next.js Image |
| Style Studio UI | React, Radix UI, TanStack Query, optimistic mutations |

---

*Generated for the AI Personal Wardrobe & Virtual Fashion Platform project.*
