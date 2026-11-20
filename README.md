# Barber Shop

This repository is organized as a monorepo:

- `frontend/` contains the React/Vite application.
- `backend/` contains the Fastify + Prisma API (see `backend/README.md`).

Both application Dockerfiles use the repository root as their build context. This matches Northflank: use `.` as the build context and `frontend/Dockerfile` or `backend/Dockerfile` as the Dockerfile path.

For the Northflank frontend service, set the runtime variable `BACKEND_INTERNAL_URL=http://barber-shop:3000`. The browser calls the relative `/api` path, while Nginx proxies it privately to the backend service.

## Frontend development

```bash
cd frontend
npm install
npm run dev
```

From `frontend/`, the available scripts are:

- `npm run dev` starts the development server.
- `npm run build` type-checks and builds the production bundle.
- `npm run lint` runs ESLint.
- `npm run preview` previews the production bundle.
- `npm test` runs the Vitest + Testing Library suite (`npm run test:watch` for watch mode).

All data comes from the API: the frontend keeps no business data in memory or `localStorage` (only the session token).
API calls live in `src/api/`, shared state in `src/contexts/` (one context, provider and `src/hooks/use*` hook each),
pure helpers in `src/lib/`, and reusable screen pieces in `src/components/`.
