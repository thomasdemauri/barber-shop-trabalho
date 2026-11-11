# Barber Shop

This repository is organized as a monorepo:

- `frontend/` contains the React/Vite application.
- `backend/` is reserved for the backend application.

Both application Dockerfiles use the repository root as their build context. This matches Northflank: use `.` as the build context and `frontend/Dockerfile` or `backend/Dockerfile` as the Dockerfile path.

For the Northflank frontend service, set the build variable `VITE_PROD=true` and runtime variable `BACKEND_INTERNAL_URL=http://barber-shop:3000`. The browser then calls `/api`, while Nginx proxies it privately to the backend service.

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
