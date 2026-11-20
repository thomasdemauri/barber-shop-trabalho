import type { Clock } from './shared/domain/clock.js';
import type { NotificationPublisher } from './modules/notifications/application/notification-publisher.js';
import { AuthenticateUser } from './modules/identity/application/authenticate-user.js';
import { GetUser } from './modules/identity/application/get-user.js';
import { ListClients } from './modules/identity/application/list-clients.js';
import { RequestPasswordReset, ResetPassword } from './modules/identity/application/password-reset.js';
import { GetPreferences, UpdatePreferences } from './modules/identity/application/preferences.js';
import { RegisterUser } from './modules/identity/application/register-user.js';
import { UpdateProfile } from './modules/identity/application/update-profile.js';
import type { PasswordHasher } from './modules/identity/domain/password-hasher.js';
import type { PasswordResetRepository } from './modules/identity/domain/password-reset.js';
import type { UserPreferencesRepository } from './modules/identity/domain/user-preferences.js';
import type { UserRepository } from './modules/identity/domain/user-repository.js';
import type { IdentityUseCases } from './modules/identity/http/identity-routes.js';
import { ListBarbers } from './modules/catalog/application/list-barbers.js';
import {
  CreateServiceOffering,
  ListServiceOfferings,
  UpdateServiceOffering,
} from './modules/catalog/application/service-offerings.js';
import type { BarberRepository } from './modules/catalog/domain/barber.js';
import type { ServiceOfferingRepository } from './modules/catalog/domain/service-offering.js';
import type { CatalogUseCases } from './modules/catalog/http/catalog-routes.js';
import { GetShopSettings, UpdateShopSettings } from './modules/shop/application/shop-settings.js';
import type { ShopSettingsRepository } from './modules/shop/domain/shop-settings.js';
import type { ShopUseCases } from './modules/shop/http/shop-routes.js';
import { AppointmentAccess } from './modules/scheduling/application/appointment-access.js';
import { AppointmentNotifier } from './modules/scheduling/application/appointment-notifier.js';
import { BookAppointment } from './modules/scheduling/application/book-appointment.js';
import { CancelAppointment } from './modules/scheduling/application/cancel-appointment.js';
import { ChangeAppointmentStatus } from './modules/scheduling/application/change-appointment-status.js';
import { GetAvailability } from './modules/scheduling/application/get-availability.js';
import { ListAppointments } from './modules/scheduling/application/list-appointments.js';
import type { AppointmentQueries } from './modules/scheduling/application/ports.js';
import { RescheduleAppointment } from './modules/scheduling/application/reschedule-appointment.js';
import { GetMySchedule, ListSchedules, UpdateBarberSchedule } from './modules/scheduling/application/schedules.js';
import type { AppointmentRepository, BookingUnitOfWork, ScheduleRepository } from './modules/scheduling/domain/repositories.js';
import { ShopTimeZone } from './modules/scheduling/domain/shop-time-zone.js';
import { CatalogBarberAdapter, CatalogServiceAdapter } from './modules/scheduling/infrastructure/catalog-adapters.js';
import type { SchedulingUseCases } from './modules/scheduling/http/scheduling-routes.js';

/** Every adapter the use cases depend on. Production wires Prisma/RabbitMQ; tests wire in-memory fakes. */
export type Infrastructure = {
  clock: Clock;
  notifications: NotificationPublisher;
  passwordHasher: PasswordHasher;
  users: UserRepository;
  preferences: UserPreferencesRepository;
  passwordResets: PasswordResetRepository;
  services: ServiceOfferingRepository;
  barbers: BarberRepository;
  shopSettings: ShopSettingsRepository;
  appointments: AppointmentRepository;
  appointmentQueries: AppointmentQueries;
  bookingUnitOfWork: BookingUnitOfWork;
  schedules: ScheduleRepository;
};

export type UseCases = {
  identity: IdentityUseCases;
  catalog: CatalogUseCases;
  shop: ShopUseCases;
  scheduling: SchedulingUseCases;
};

export type SchedulingConfig = { shopTimeZone: string; slotIntervalMinutes: number };

export function createUseCases(infra: Infrastructure, config: SchedulingConfig): UseCases {
  const { clock, notifications, passwordHasher, users } = infra;
  const serviceCatalog = new CatalogServiceAdapter(infra.services);
  const barberDirectory = new CatalogBarberAdapter(infra.barbers);
  const access = new AppointmentAccess(barberDirectory);
  const timeZone = new ShopTimeZone(config.shopTimeZone);
  const { appointments, appointmentQueries: queries, bookingUnitOfWork: unitOfWork, schedules } = infra;
  const notifier = new AppointmentNotifier(queries, notifications, clock);

  return {
    identity: {
      registerUser: new RegisterUser(users, passwordHasher, clock),
      authenticateUser: new AuthenticateUser(users, passwordHasher),
      getUser: new GetUser(users),
      updateProfile: new UpdateProfile(users, passwordHasher),
      getPreferences: new GetPreferences(infra.preferences),
      updatePreferences: new UpdatePreferences(infra.preferences),
      listClients: new ListClients(users),
      requestPasswordReset: new RequestPasswordReset(users, infra.passwordResets, notifications, clock),
      resetPassword: new ResetPassword(users, infra.passwordResets, passwordHasher, clock),
    },
    catalog: {
      listServiceOfferings: new ListServiceOfferings(infra.services),
      createServiceOffering: new CreateServiceOffering(infra.services),
      updateServiceOffering: new UpdateServiceOffering(infra.services),
      listBarbers: new ListBarbers(infra.barbers),
    },
    shop: {
      getShopSettings: new GetShopSettings(infra.shopSettings),
      updateShopSettings: new UpdateShopSettings(infra.shopSettings),
    },
    scheduling: {
      getAvailability: new GetAvailability(
        serviceCatalog, barberDirectory, schedules, appointments, timeZone,
        { slotIntervalMinutes: config.slotIntervalMinutes }, clock,
      ),
      bookAppointment: new BookAppointment(
        serviceCatalog, barberDirectory, schedules, unitOfWork, queries, notifier, timeZone, clock,
      ),
      rescheduleAppointment: new RescheduleAppointment(
        appointments, serviceCatalog, schedules, unitOfWork, queries, access, timeZone, clock,
      ),
      cancelAppointment: new CancelAppointment(appointments, unitOfWork, access, notifier),
      changeAppointmentStatus: new ChangeAppointmentStatus(appointments, unitOfWork, queries, access, notifier),
      listAppointments: new ListAppointments(queries, access),
      listSchedules: new ListSchedules(schedules),
      getMySchedule: new GetMySchedule(schedules, barberDirectory),
      updateBarberSchedule: new UpdateBarberSchedule(schedules, barberDirectory),
    },
  };
}
