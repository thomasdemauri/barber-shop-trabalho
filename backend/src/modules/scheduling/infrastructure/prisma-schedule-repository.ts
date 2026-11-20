import type { PrismaClient, Schedule as ScheduleRow } from '@prisma/client';
import type { ScheduleRepository } from '../domain/repositories.js';
import { WeeklySchedule } from '../domain/weekly-schedule.js';

const toDomain = (barberId: string, rows: ScheduleRow[]) => WeeklySchedule.create(
  barberId,
  rows.filter(row => row.active).map(({ weekday, openTime, closeTime }) => ({ weekday, openTime, closeTime })),
);

export class PrismaScheduleRepository implements ScheduleRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByBarberId(barberId: string) {
    const rows = await this.db.schedule.findMany({ where: { barberId } });
    return rows.length ? toDomain(barberId, rows) : null;
  }

  async list() {
    const barbers = await this.db.barber.findMany({ select: { id: true, schedules: true } });
    return barbers.map(barber => toDomain(barber.id, barber.schedules));
  }

  /** Replaces the whole week: days not in the schedule are removed. */
  async save(schedule: WeeklySchedule) {
    const days = schedule.workingDays;
    await this.db.$transaction([
      this.db.schedule.deleteMany({
        where: { barberId: schedule.barberId, weekday: { notIn: days.map(day => day.weekday) } },
      }),
      ...days.map(day => {
        const data = { openTime: day.opensAt.toString(), closeTime: day.closesAt.toString(), active: true };
        return this.db.schedule.upsert({
          where: { barberId_weekday: { barberId: schedule.barberId, weekday: day.weekday } },
          create: { barberId: schedule.barberId, weekday: day.weekday, ...data },
          update: data,
        });
      }),
    ]);
  }
}
