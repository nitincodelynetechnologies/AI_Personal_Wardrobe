# AI Personal Wardrobe Platform

The monorepo lives in **`wardrobe-ai/`**.

## Fix 404 — Start the frontend from the correct folder

After the monorepo restructure, the Next.js app is at `wardrobe-ai/frontend/`.

```powershell
cd wardrobe-ai\frontend
npm install
npm run dev
```

Or from the monorepo root:

```powershell
cd wardrobe-ai
npm run setup
npm run dev
```

Then open **http://localhost:3003** (not port 3000 or 3002).

| URL | Page |
|-----|------|
| http://localhost:3003 | Home |
| http://localhost:3003/register/face | Face registration |
| http://localhost:3003/dashboard | Dashboard |

## Infrastructure (Docker)

```powershell
cd wardrobe-ai
cp .env.example .env
docker compose up -d
```

See [wardrobe-ai/docs/SETUP.md](wardrobe-ai/docs/SETUP.md).

## Still seeing 404?

1. Stop any old dev server (Ctrl+C in the terminal running `npm run dev`)
2. Make sure you are **not** running from the old root folder (there is no `package.json` there anymore)
3. Run from `wardrobe-ai/frontend` as shown above
4. Hard refresh the browser (Ctrl+Shift+R)
