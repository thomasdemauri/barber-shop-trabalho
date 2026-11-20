import type { Appointment as AppointmentRow, Prisma } from '@prisma/client';
import { Appointment } from '../domain/appointment.js';
import type { AppointmentRepository } from '../domain/repositories.js';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'] as const;

const toDomain = (row: AppointmentRow) => Appointment.restore({
  id: row.id,
  clientId: row.userId,
  barberId: row.barberId,
  serviceId: row.serviceId,
  startsAt: row.startsAt,
  endsAt: row.endsAt,
  status: row.status,
  notes: row.notes,
  createdAt: row.createdAt,
});

/** Works with the root client or with a transaction client handed out by the unit of work. */
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}

  async findById(id: string) {
    const row = await this.db.appointment.findUnique({ where: { id } });
    return row && toDomain(row);
  }

  async findActiveForBarbers(barberIds: string[], from: Date, to: Date) {
    const rows = await this.db.appointment.findMany({
      where: {
        barberId: { in: barberIds },
        status: { in: [...ACTIVE_STATUSES] },
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
    });
    return rows.map(toDomain);
  }

  async save(appointment: Appointment) {
    const { id, clientId, ...data } = appointment.toSnapshot();
    await this.db.appointment.upsert({
      where: { id },
      create: { id, userId: clientId, ...data },
      update: { userId: clientId, ...data },
    });
  }
}
