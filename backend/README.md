# Barbershop API

Fastify + TypeScript + Prisma API for the barbershop frontend. Set `DATABASE_URL` and `JWT_SECRET` (see `.env.example`), then:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed        # or prisma:seed:demo for the demo clients and agenda
npm run dev
```

The backend Dockerfile uses the repository root as its build context. This matches the Northflank configuration: set the build context to `.` and the Dockerfile path to `backend/Dockerfile`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | dev-only value | Required when `NODE_ENV=production`. |
| `SHOP_TIMEZONE` | `America/Sao_Paulo` | Zone in which working hours (`"08:00"`) are interpreted. |
| `SLOT_INTERVAL_MINUTES` | `30` | Minutes between bookable start times. |
| `RABBITMQ_URL` | `amqp://localhost` | Notification broker; outages are logged and never fail a request. |
| `SEED_DEMO_DATA` | `false` (`true` in docker-compose) | Seeds 20 Brazilian demo clients and ~380 appointments (Nov 2026 – Jan 2027). Logins in [`prisma/DEMO_USERS.md`](prisma/DEMO_USERS.md). |

## Architecture (DDD)

Code is split into bounded contexts under `src/modules/`, each with the same layers:

```
src/
  shared/            Shared kernel: domain errors, Role, Clock, HTTP auth plugin and error mapping
  modules/
    identity/        Users, authentication, profile, preferences, password reset
    catalog/         Services offered and barbers
    scheduling/      Weekly schedules, availability, appointment lifecycle
    shop/            Shop settings (name)
    notifications/   Event contract, RabbitMQ publisher/consumer, e-mail templates and providers
      domain/          Entities, value objects and repository interfaces — no framework imports
      application/     One class per use case; depends only on domain interfaces (ports)
      infrastructure/  Prisma / argon2 / RabbitMQ adapters implementing those interfaces
      http/            Fastify routes: validate input (zod), call a use case, present the result
  container.ts       Composition root: builds every use case from an `Infrastructure` object
  infrastructure.ts  Production `Infrastructure` (Prisma + argon2 + RabbitMQ)
  app.ts             Fastify app factory (used by the server and by HTTP tests)
  server.ts          API process entry point
  worker.ts          Notification worker process entry point
```

Key rules live in the domain: `Appointment` owns its status lifecycle (`PENDING → CONFIRMED → COMPLETED`, cancel while active,
rescheduling returns to `PENDING`), `WeeklySchedule` decides whether a service fits a barber's hours, `slotsForDay` computes
availability, and `ShopTimeZone` converts between shop wall-clock time and UTC instants. Scheduling reads the catalog only
through its own ports (`ServiceCatalog`, `BarberDirectory`), implemented by adapters in `scheduling/infrastructure`.

Writes for one barber run through `BookingUnitOfWork`: a serializable transaction holding a PostgreSQL advisory lock, so two
clients cannot take the same slot. Without a preferred barber, the first free barber (by name) who works at that time is assigned.

## Endpoints (prefix `/api`)

| Method & path | Who | Use case |
| --- | --- | --- |
| `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | public / any | Sign up, sign in, current user |
| `POST /auth/password/forgot`, `POST /auth/password/reset` | public | Publish a reset token (`password.reset_requested`), redeem it |
| `PATCH /profile`, `GET`/`PATCH /profile/preferences` | any | Contact data, password, haircut/notification/payment preferences |
| `GET /catalog/services`, `GET /catalog/barbers` | public | Active services, barbers |
| `GET /admin/services`, `POST /admin/services`, `PATCH /admin/services/:id` | admin | Manage services (including inactive) |
| `GET /admin/clients` | admin, barber | Client list |
| `GET /shop/settings`, `PUT /admin/shop/settings` | public / admin | Shop name |
| `GET /availability?date&serviceId[&barberId][&ignoreAppointmentId]` | public | Slots of a day with UTC `startsAt` |
| `GET /schedules`, `GET`/`PUT /schedules/me`, `PUT /admin/schedules/:barberId` | public / barber / admin | Weekly schedules |
| `GET /appointments` | any | Scoped by role: own (client), own agenda (barber), all (admin) |
| `POST /appointments` | client | Book |
| `PATCH /appointments/:id`, `DELETE /appointments/:id` | owner, staff | Reschedule, cancel |
| `PATCH /admin/appointments/:id` | admin, assigned barber | Confirm, refuse (cancel) or complete |

Errors use `{ error, message, details? }`: validation 400, credentials 401, permission 403, missing 404, conflicts 409.

## Notifications

The API publishes an event to the `barbershop.notifications` topic exchange whenever an appointment changes; the
**notification worker** (`src/worker.ts`, service `notification-worker` in docker-compose, same image as the API) consumes
the queues and e-mails the person who must know:

| Event | Trigger | Queue | E-mail to |
| --- | --- | --- | --- |
| `appointment.booked` | Client books | `notifications.barber` | Barber |
| `appointment.canceled_by_client` | Client cancels | `notifications.barber` | Barber |
| `appointment.confirmed` | Barber/admin confirms | `notifications.client` | Client |
| `appointment.canceled_by_barber` | Barber/admin cancels | `notifications.client` | Client |
| `password.reset_requested` | Forgot password | `notifications.email` | User (reset link) |

- Events are self-contained (names, e-mails, service, time — schema in `notifications/domain/notification-event.ts`),
  so the worker needs no database.
- Delivery is at-least-once: failed sends are retried with exponential back-off (`NOTIFICATION_MAX_ATTEMPTS`,
  `NOTIFICATION_RETRY_DELAY_MS`); malformed messages and exhausted retries go to `notifications.dead`.
  Each e-mail carries an `idempotencyKey`; providers that support deduplication use it (Brevo only logs it as a header).
- E-mails go through the `EmailProvider` port (`verify`, `send`), chosen with `EMAIL_PROVIDER`:
  - `memory` (default): `InMemoryEmailProvider` simulates sending — messages are logged as `simulated e-mail (not sent)`.
  - `brevo`: `BrevoEmailProvider` sends through the [Brevo](https://www.brevo.com) transactional API using `BREVO_API_KEY`.
    No domain is needed: `EMAIL_FROM` must be a sender verified in Brevo (e.g. your Gmail). The key is checked at
    start-up; Brevo blocks unknown IPs by default, so authorise the server IP under Security → Authorised IPs.
    Rejections that retrying cannot fix (bad key, unauthorised IP, unverified sender, invalid recipient) go straight to
    `notifications.dead`; rate limits, used-up daily credits and outages are retried.
- Worker settings: `EMAIL_FROM`, `BREVO_API_KEY`, `SHOP_NAME`, `SHOP_TIMEZONE`, `FRONTEND_URL` (links in e-mails).
  Run locally with `npm run worker`.

## Tests

```bash
npm test
```

Jasmine runs against the compiled TypeScript:

- `test/unit` — domain rules and infrastructure helpers (time zones, slots, status lifecycle, routing keys, config).
- `test/application` — every use case against in-memory adapters (`test/support/in-memory.ts`).
- `test/http` — the real Fastify app through `inject`, covering status codes, auth and validation.
- `test/integration` — the Prisma adapters against PostgreSQL, and publisher → RabbitMQ → worker end to end. Skipped unless
  `TEST_DATABASE_URL` points to a migrated, disposable database (its tables are wiped) and/or `TEST_RABBITMQ_URL` points to a
  disposable broker (its notification queues are purged):

```bash
docker run -d --rm --name barbershop-test-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=barbershop_test -p 55432:5432 postgres:16-alpine
DATABASE_URL=postgresql://postgres:test@localhost:55432/barbershop_test npx prisma migrate deploy
TEST_DATABASE_URL=postgresql://postgres:test@localhost:55432/barbershop_test npm test

docker run -d --rm --name barbershop-test-mq -p 5673:5672 rabbitmq:3-alpine
TEST_RABBITMQ_URL=amqp://guest:guest@localhost:5673 npm test
```
