import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { actorOf } from '../../../shared/http/auth-plugin.js';
import { calendarDate, idParams, localTime, parse } from '../../../shared/http/validation.js';
import type { BookAppointment } from '../application/book-appointment.js';
import type { CancelAppointment } from '../application/cancel-appointment.js';
import type { ChangeAppointmentStatus } from '../application/change-appointment-status.js';
import type { GetAvailability } from '../application/get-availability.js';
import type { ListAppointments } from '../application/list-appointments.js';
import type { RescheduleAppointment } from '../application/reschedule-appointment.js';
import type { GetMySchedule, ListSchedules, UpdateBarberSchedule } from '../application/schedules.js';
import type { Slot } from '../domain/availability.js';
import type { WeeklySchedule } from '../domain/weekly-schedule.js';

export type SchedulingUseCases = {
  getAvailability: GetAvailability;
  bookAppointment: BookAppointment;
  rescheduleAppointment: RescheduleAppointment;
  cancelAppointment: CancelAppointment;
  changeAppointmentStatus: ChangeAppointmentStatus;
  listAppointments: ListAppointments;
  listSchedules: ListSchedules;
  getMySchedule: GetMySchedule;
  updateBarberSchedule: UpdateBarberSchedule;
};

export const presentSchedule = (schedule: WeeklySchedule) => ({
  barberId: schedule.barberId,
  days: schedule.workingDays.map(day => ({
    weekday: day.weekday,
    openTime: day.opensAt.toString(),
    closeTime: day.closesAt.toString(),
  })),
});

const presentSlot = (slot: Slot) => ({
  time: slot.time.toString(),
  startsAt: slot.startsAt.toISOString(),
  available: slot.available,
});

const instant = z.string().datetime({ offset: true }).transform(value => new Date(value));
const availabilityQuery = z.object({
  date: calendarDate,
  serviceId: z.string().min(1),
  barberId: z.string().min(1).optional(),
  ignoreAppointmentId: z.string().min(1).optional(),
});
const bookBody = z.object({
  serviceId: z.string().min(1),
  startsAt: instant,
  barberId: z.string().min(1).optional(),
  notes: z.string().max(500).optional(),
});
const rescheduleBody = z.object({ serviceId: z.string().min(1).optional(), startsAt: instant.optional() })
  .refine(body => body.serviceId !== undefined || body.startsAt !== undefined, 'Informe o serviço ou o horário');
const statusBody = z.object({ status: z.enum(['CONFIRMED', 'CANCELED', 'COMPLETED']) });
const scheduleBody = z.object({
  days: z.array(z.object({ weekday: z.number().int(), openTime: localTime, closeTime: localTime })).max(7),
});
const barberParams = z.object({ barberId: z.string().min(1) });

export function schedulingRoutes(useCases: SchedulingUseCases) {
  return async (app: FastifyInstance) => {
    app.get('/availability', async request => {
      const availability = await useCases.getAvailability.execute(parse(availabilityQuery, request.query));
      return { date: availability.date, slots: availability.slots.map(presentSlot) };
    });

    app.get('/schedules', async () => (await useCases.listSchedules.execute()).map(presentSchedule));

    app.get('/schedules/me', { preHandler: app.requireRoles('BARBER', 'ADMIN') }, async request =>
      presentSchedule(await useCases.getMySchedule.execute(actorOf(request))));

    app.put('/schedules/me', { preHandler: app.requireRoles('BARBER', 'ADMIN') }, async request => {
      const { days } = parse(scheduleBody, request.body);
      return presentSchedule(await useCases.updateBarberSchedule.executeForSelf(actorOf(request), days));
    });

    app.put('/admin/schedules/:barberId', { preHandler: app.requireRoles('ADMIN') }, async request => {
      const { barberId } = parse(barberParams, request.params);
      const { days } = parse(scheduleBody, request.body);
      return presentSchedule(await useCases.updateBarberSchedule.execute(actorOf(request), barberId, days));
    });

    app.get('/appointments', { preHandler: app.authenticate }, async request =>
      useCases.listAppointments.execute(actorOf(request)));

    app.post('/appointments', { preHandler: app.requireRoles('CLIENT') }, async (request, reply) => {
      const view = await useCases.bookAppointment.execute(actorOf(request), parse(bookBody, request.body));
      return reply.code(201).send(view);
    });

    app.patch('/appointments/:id', { preHandler: app.authenticate }, async request => {
      const { id } = parse(idParams, request.params);
      return useCases.rescheduleAppointment.execute(actorOf(request), id, parse(rescheduleBody, request.body));
    });

    app.delete('/appointments/:id', { preHandler: app.authenticate }, async (request, reply) => {
      const { id } = parse(idParams, request.params);
      await useCases.cancelAppointment.execute(actorOf(request), id);
      return reply.code(204).send();
    });

    app.patch('/admin/appointments/:id', { preHandler: app.requireRoles('ADMIN', 'BARBER') }, async request => {
      const { id } = parse(idParams, request.params);
      const { status } = parse(statusBody, request.body);
      return useCases.changeAppointmentStatus.execute(actorOf(request), id, status);
    });
  };
}
