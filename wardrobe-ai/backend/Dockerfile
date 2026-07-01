FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ ./
COPY database/postgres/migrations ./database/postgres/migrations

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

RUN mkdir -p uploads/wardrobe

ENV PORT=3001
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const p=process.env.PORT||3001;fetch('http://127.0.0.1:'+p+'/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
