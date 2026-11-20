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

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:

| Job | What it runs |
| --- | --- |
| Backend tests | Type check and the Jasmine suite, including the integration specs against PostgreSQL and RabbitMQ service containers |
| Frontend tests | ESLint, Vitest and the production build |
| End-to-end tests | The whole docker-compose stack plus Playwright (`e2e/`): a client signs up and books with Carlos, the barber confirms it in the agenda, and the worker sends the confirmation e-mail (simulated) |

Run the end-to-end tests locally:

```bash
EMAIL_PROVIDER=memory SEED_DEMO_DATA=false docker compose up -d --build --wait
cd e2e && npm ci && npx playwright install chromium && npx playwright test
```

`EMAIL_PROVIDER=memory` keeps the test from sending real e-mails, and the test reads the simulated ones from the worker logs.
