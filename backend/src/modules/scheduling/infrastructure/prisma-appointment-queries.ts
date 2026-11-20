import type { Prisma, PrismaClient } from '@prisma/client';
import type { AppointmentParticipants, AppointmentQueries, AppointmentScope, AppointmentView } from '../application/ports.js';

const include = { user: true, service: true, barber: { include: { user: true } } } satisfies Prisma.AppointmentInclude;
type AppointmentWithRelations = Prisma.AppointmentGetPayload<{ include: typeof include }>;

const toView = (row: AppointmentWithRelations): AppointmentView => ({
  id: row.id,
  status: row.status,
  startsAt: row.startsAt.toISOString(),
  endsAt: row.endsAt.toISOString(),
  notes: row.notes,
  createdAt: row.createdAt.toISOString(),
  client: { id: row.user.id, name: row.user.name, email: row.user.email, phone: row.user.phone },
  barber: { id: row.barber.id, name: row.barber.user.name },
  service: {
    id: row.service.id,
    name: row.service.name,
    price: Number(row.service.price),
    durationMinutes: row.service.durationMinutes,
  },
});

const whereFor = (scope: AppointmentScope): Prisma.AppointmentWhereInput => {
  switch (scope.kind) {
    case 'all': return {};
    case 'client': return { userId: scope.clientId };
    case 'barber': return { barberId: scope.barberId };
  }
};

export class PrismaAppointmentQueries implements AppointmentQueries {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.appointment.findUnique({ where: { id }, include });
    return row && toView(row);
  }

  async findParticipants(id: string): Promise<AppointmentParticipants | null> {
    const row = await this.db.appointment.findUnique({ where: { id }, include });
    if (!row) return null;
    return {
      appointmentId: row.id,
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      service: { name: row.service.name, price: Number(row.service.price) },
      client: { id: row.user.id, name: row.user.name, email: row.user.email },
      barber: { id: row.barber.id, name: row.barber.user.name, email: row.barber.user.email },
    };
  }

  async list(scope: AppointmentScope) {
    const rows = await this.db.appointment.findMany({ where: whereFor(scope), include, orderBy: { startsAt: 'asc' } });
    return rows.map(toView);
  }
}
