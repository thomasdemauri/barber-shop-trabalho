# Barbershop API

Fastify + TypeScript API for the barbershop frontend. Set `DATABASE_URL` and `JWT_SECRET` (see `.env.example`), then:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

The API exposes `/api/auth`, `/api/catalog`, `/api/availability`, `/api/appointments`, `/api/profile`, and `/api/admin` routes. Appointment creation uses a serializable Prisma transaction, PostgreSQL advisory locking, and overlap checks. Errors use `{ error, message, details? }`; validation failures return 400, conflicts 409, and authentication/authorization failures 401/403.

## Unit tests

Unit tests use Jasmine 5 and run against compiled TypeScript without starting PostgreSQL or a browser:

```bash
npm test
```

The suite covers password hashing and verification, service catalog integrity, schedule availability, appointment duration, interval overlap, and active appointment conflicts. End-to-end tests are intentionally out of scope for this suite.
