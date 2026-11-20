import type { PrismaClient } from '@prisma/client';
import { slotUnavailable } from '../application/shared.js';
import type { AppointmentRepository, BookingUnitOfWork } from '../domain/repositories.js';
import { PrismaAppointmentRepository } from './prisma-appointment-repository.js';

const SERIALIZATION_FAILURE = 'P2034';

/**
 * A serializable transaction holding a PostgreSQL advisory lock keyed by barber,
 * so concurrent bookings for the same barber run one after another.
 */
export class PrismaBookingUnitOfWork implements BookingUnitOfWork {
  constructor(private readonly db: PrismaClient) {}

  async runExclusively<T>(barberId: string, work: (appointments: AppointmentRepository) => Promise<T>) {
    try {
      return await this.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${barberId}))`;
        return work(new PrismaAppointmentRepository(tx));
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if ((error as { code?: string }).code === SERIALIZATION_FAILURE) throw slotUnavailable();
      throw error;
    }
  }
}
