# Garnish
Garnish is a full-stack recipe discovery and management platform built for the COP 4331 large project.
It supports:
- recipe search by request (vegan, kosher, craving, ingredients, cuisine)
- recipe CRUD
- JWT authentication
- email verification
- forgot-password / password reset
- React web app
- Express + MongoDB backend

## Package structure

- `server/` — Express + MongoDB API
- `web/` — React + TypeScript web client
- `mobile/` — Flutter mobile client

## Quick start

### Server
```bash
cd server
npm install
npm run dev
```

### Web
```bash
cd web
npm install
npm run dev
```

## External Recipe Search
- Set `SPOONACULAR_API_KEY` on the server to enable primary search.
- If Spoonacular is unavailable or no key is present, Garnish falls back to TheMealDB automatically.
- The web app can save an external recipe into the user's Garnish collection through `/api/recipes/import`.
