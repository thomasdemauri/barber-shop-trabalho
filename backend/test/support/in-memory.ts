import type { Infrastructure } from '../../src/container.js';
import type { Clock } from '../../src/shared/domain/clock.js';
import type { Role } from '../../src/shared/domain/role.js';
import type { NotificationEvent, NotificationPublisher } from '../../src/modules/notifications/application/notification-publisher.js';
import type { PasswordHasher } from '../../src/modules/identity/domain/password-hasher.js';
import { PasswordReset, type PasswordResetRepository } from '../../src/modules/identity/domain/password-reset.js';
import type { UserPreferences, UserPreferencesRepository } from '../../src/modules/identity/domain/user-preferences.js';
import { User } from '../../src/modules/identity/domain/user.js';
import type { UserRepository } from '../../src/modules/identity/domain/user-repository.js';
import type { Barber, BarberRepository } from '../../src/modules/catalog/domain/barber.js';
import { ServiceOffering, type ServiceOfferingRepository } from '../../src/modules/catalog/domain/service-offering.js';
import type { ShopSettings, ShopSettingsRepository } from '../../src/modules/shop/domain/shop-settings.js';
import type { AppointmentParticipants, AppointmentQueries, AppointmentScope, AppointmentView } from '../../src/modules/scheduling/application/ports.js';
import { Appointment } from '../../src/modules/scheduling/domain/appointment.js';
import type { AppointmentRepository, BookingUnitOfWork, ScheduleRepository } from '../../src/modules/scheduling/domain/repositories.js';
import type { WeeklySchedule } from '../../src/modules/scheduling/domain/weekly-schedule.js';

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now() { return new Date(this.current); }
  set(value: Date) { this.current = value; }
}

export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string) { return `hashed:${plain}`; }
  async verify(hash: string, plain: string) { return hash === `hashed:${plain}`; }
}

export class RecordingNotificationPublisher implements NotificationPublisher {
  readonly published: NotificationEvent[] = [];
  async publish(event: NotificationEvent) { this.published.push(event); }
  async close() {}
}

export class InMemoryUserRepository implements UserRepository {
  readonly rows = new Map<string, User>();
  async findById(id: string) { return this.copy(this.rows.get(id)); }
  async findByEmail(email: string) { return this.copy([...this.rows.values()].find(user => user.email === email)); }
  async findByPhone(phone: string) { return this.copy([...this.rows.values()].find(user => user.phone === phone)); }
  async listByRole(role: Role) { return [...this.rows.values()].filter(user => user.role === role).map(user => this.copy(user)!); }
  async save(user: User) { this.rows.set(user.id, User.restore(user.toSnapshot())); }
  private copy(user: User | undefined) { return user ? User.restore(user.toSnapshot()) : null; }
}

export class InMemoryUserPreferencesRepository implements UserPreferencesRepository {
  readonly rows = new Map<string, UserPreferences>();
  async findByUserId(userId: string) { return this.rows.get(userId) ?? null; }
  async save(userId: string, preferences: UserPreferences) { this.rows.set(userId, structuredClone(preferences)); }
}

export class InMemoryPasswordResetRepository implements PasswordResetRepository {
  readonly rows = new Map<string, PasswordReset>();
  async findByTokenHash(tokenHash: string) {
    const reset = this.rows.get(tokenHash);
    return reset ? PasswordReset.restore(reset.toSnapshot()) : null;
  }
  async save(reset: PasswordReset) { this.rows.set(reset.toSnapshot().tokenHash, PasswordReset.restore(reset.toSnapshot())); }
}

export class InMemoryServiceOfferingRepository implements ServiceOfferingRepository {
  readonly rows = new Map<string, ServiceOffering>();
  async findById(id: string) { return this.copy(this.rows.get(id)); }
  async list({ includeInactive }: { includeInactive: boolean }) {
    return [...this.rows.values()].filter(service => includeInactive || service.active).map(service => this.copy(service)!);
  }
  async save(service: ServiceOffering) { this.rows.set(service.id, ServiceOffering.restore(service.toSnapshot())); }
  private copy(service: ServiceOffering | undefined) { return service ? ServiceOffering.restore(service.toSnapshot()) : null; }
}

export class InMemoryBarberRepository implements BarberRepository {
  readonly rows: Barber[] = [];
  async list() { return [...this.rows]; }
  async findById(id: string) { return this.rows.find(barber => barber.id === id) ?? null; }
  async findByUserId(userId: string) { return this.rows.find(barber => barber.userId === userId) ?? null; }
}

export class InMemoryShopSettingsRepository implements ShopSettingsRepository {
  current: ShopSettings | null = null;
  async find() { return this.current; }
  async save(settings: ShopSettings) { this.current = { ...settings }; }
}

export class InMemoryAppointmentRepository implements AppointmentRepository {
  readonly rows = new Map<string, Appointment>();
  async findById(id: string) { return this.copy(this.rows.get(id)); }
  async findActiveForBarbers(barberIds: string[], from: Date, to: Date) {
    return [...this.rows.values()]
      .filter(appointment => barberIds.includes(appointment.barberId) && appointment.isActive && appointment.overlaps(from, to))
      .map(appointment => this.copy(appointment)!);
  }
  async save(appointment: Appointment) { this.rows.set(appointment.id, Appointment.restore(appointment.toSnapshot())); }
  private copy(appointment: Appointment | undefined) { return appointment ? Appointment.restore(appointment.toSnapshot()) : null; }
}

/** Mimics the advisory lock: work for the same barber runs strictly one after another. */
export class InMemoryBookingUnitOfWork implements BookingUnitOfWork {
  private readonly queues = new Map<string, Promise<unknown>>();
  readonly lockedBarbers: string[] = [];

  constructor(private readonly appointments: AppointmentRepository) {}

  runExclusively<T>(barberId: string, work: (appointments: AppointmentRepository) => Promise<T>) {
    const previous = this.queues.get(barberId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(() => {
      this.lockedBarbers.push(barberId);
      return work(this.appointments);
    });
    this.queues.set(barberId, next);
    return next;
  }
}

export class InMemoryScheduleRepository implements ScheduleRepository {
  readonly rows = new Map<string, WeeklySchedule>();
  constructor(private readonly barbers: InMemoryBarberRepository) {}
  async findByBarberId(barberId: string) { return this.rows.get(barberId) ?? null; }
  async list() { return this.barbers.rows.map(barber => this.rows.get(barber.id)).filter((s): s is WeeklySchedule => !!s); }
  async save(schedule: WeeklySchedule) { this.rows.set(schedule.barberId, schedule); }
}

export class InMemoryAppointmentQueries implements AppointmentQueries {
  constructor(
    private readonly appointments: InMemoryAppointmentRepository,
    private readonly users: InMemoryUserRepository,
    private readonly barbers: InMemoryBarberRepository,
    private readonly services: InMemoryServiceOfferingRepository,
  ) {}

  async findById(id: string) {
    const appointment = this.appointments.rows.get(id);
    return appointment ? this.toView(appointment) : null;
  }

  async list(scope: AppointmentScope) {
    return [...this.appointments.rows.values()]
      .filter(appointment => scope.kind === 'all'
        || (scope.kind === 'client' && appointment.clientId === scope.clientId)
        || (scope.kind === 'barber' && appointment.barberId === scope.barberId))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .map(appointment => this.toView(appointment));
  }

  async findParticipants(id: string): Promise<AppointmentParticipants | null> {
    const view = await this.findById(id);
    if (!view) return null;
    const barber = this.barbers.rows.find(row => row.id === view.barber.id)!;
    const barberUser = this.users.rows.get(barber.userId)!;
    return {
      appointmentId: view.id,
      startsAt: view.startsAt,
      endsAt: view.endsAt,
      service: { name: view.service.name, price: view.service.price },
      client: { id: view.client.id, name: view.client.name, email: view.client.email },
      barber: { id: barber.id, name: barber.name, email: barberUser.email },
    };
  }

  private toView(appointment: Appointment): AppointmentView {
    const client = this.users.rows.get(appointment.clientId)!;
    const barber = this.barbers.rows.find(row => row.id === appointment.barberId)!;
    const service = this.services.rows.get(appointment.serviceId)!;
    const snapshot = appointment.toSnapshot();
    return {
      id: snapshot.id,
      status: snapshot.status,
      startsAt: snapshot.startsAt.toISOString(),
      endsAt: snapshot.endsAt.toISOString(),
      notes: snapshot.notes,
      createdAt: snapshot.createdAt.toISOString(),
      client: { id: client.id, name: client.name, email: client.email, phone: client.phone },
      barber: { id: barber.id, name: barber.name },
      service: { id: service.id, name: service.name, price: service.price, durationMinutes: service.durationMinutes },
    };
  }
}

export type TestInfrastructure = Infrastructure & {
  clock: FixedClock;
  notifications: RecordingNotificationPublisher;
  users: InMemoryUserRepository;
  preferences: InMemoryUserPreferencesRepository;
  passwordResets: InMemoryPasswordResetRepository;
  services: InMemoryServiceOfferingRepository;
  barbers: InMemoryBarberRepository;
  shopSettings: InMemoryShopSettingsRepository;
  appointments: InMemoryAppointmentRepository;
  bookingUnitOfWork: InMemoryBookingUnitOfWork;
  schedules: InMemoryScheduleRepository;
};

export function createTestInfrastructure(now = new Date('2026-11-16T12:00:00.000Z')): TestInfrastructure {
  const users = new InMemoryUserRepository();
  const barbers = new InMemoryBarberRepository();
  const services = new InMemoryServiceOfferingRepository();
  const appointments = new InMemoryAppointmentRepository();
  return {
    clock: new FixedClock(now),
    notifications: new RecordingNotificationPublisher(),
    passwordHasher: new FakePasswordHasher(),
    users,
    preferences: new InMemoryUserPreferencesRepository(),
    passwordResets: new InMemoryPasswordResetRepository(),
    services,
    barbers,
    shopSettings: new InMemoryShopSettingsRepository(),
    appointments,
    appointmentQueries: new InMemoryAppointmentQueries(appointments, users, barbers, services),
    bookingUnitOfWork: new InMemoryBookingUnitOfWork(appointments),
    schedules: new InMemoryScheduleRepository(barbers),
  };
}
