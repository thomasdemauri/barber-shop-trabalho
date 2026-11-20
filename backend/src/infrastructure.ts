import type { PrismaClient } from '@prisma/client';
import type { Infrastructure } from './container.js';
import { systemClock } from './shared/domain/clock.js';
import type { NotificationPublisher } from './modules/notifications/application/notification-publisher.js';
import { Argon2PasswordHasher } from './modules/identity/infrastructure/argon2-password-hasher.js';
import { PrismaPasswordResetRepository } from './modules/identity/infrastructure/prisma-password-reset-repository.js';
import { PrismaUserPreferencesRepository } from './modules/identity/infrastructure/prisma-user-preferences-repository.js';
import { PrismaUserRepository } from './modules/identity/infrastructure/prisma-user-repository.js';
import { PrismaBarberRepository } from './modules/catalog/infrastructure/prisma-barber-repository.js';
import { PrismaServiceOfferingRepository } from './modules/catalog/infrastructure/prisma-service-offering-repository.js';
import { PrismaShopSettingsRepository } from './modules/shop/infrastructure/prisma-shop-settings-repository.js';
import { PrismaAppointmentQueries } from './modules/scheduling/infrastructure/prisma-appointment-queries.js';
import { PrismaAppointmentRepository } from './modules/scheduling/infrastructure/prisma-appointment-repository.js';
import { PrismaBookingUnitOfWork } from './modules/scheduling/infrastructure/prisma-booking-unit-of-work.js';
import { PrismaScheduleRepository } from './modules/scheduling/infrastructure/prisma-schedule-repository.js';

export function createPrismaInfrastructure(db: PrismaClient, notifications: NotificationPublisher): Infrastructure {
  return {
    clock: systemClock,
    notifications,
    passwordHasher: new Argon2PasswordHasher(),
    users: new PrismaUserRepository(db),
    preferences: new PrismaUserPreferencesRepository(db),
    passwordResets: new PrismaPasswordResetRepository(db),
    services: new PrismaServiceOfferingRepository(db),
    barbers: new PrismaBarberRepository(db),
    shopSettings: new PrismaShopSettingsRepository(db),
    appointments: new PrismaAppointmentRepository(db),
    appointmentQueries: new PrismaAppointmentQueries(db),
    bookingUnitOfWork: new PrismaBookingUnitOfWork(db),
    schedules: new PrismaScheduleRepository(db),
  };
}
