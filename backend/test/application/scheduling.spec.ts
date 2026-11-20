import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../src/shared/domain/errors.js';
import { addBarber, seedShop, tuesdayAt } from '../support/fixtures.js';

describe('scheduling use cases', () => {
  describe('GetAvailability', () => {
    it('lists the selected barber slots in shop time', async () => {
      const { useCases, joao } = await seedShop();
      const { date, slots } = await useCases.scheduling.getAvailability.execute({ date: '2026-11-17', serviceId: 'corte', barberId: joao.barber.id });

      expect(date).toBe('2026-11-17');
      expect(slots[0].time.toString()).toBe('08:00');
      expect(slots[0].startsAt.toISOString()).toBe('2026-11-17T11:00:00.000Z');
      expect(slots.at(-1)?.time.toString()).toBe('17:00');
      expect(slots.every(slot => slot.available)).toBeTrue();
    });

    it('blocks slots taken by any client, not only the current one', async () => {
      const { useCases, otherClient, joao, actor } = await seedShop();
      await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });

      const { slots } = await useCases.scheduling.getAvailability.execute({ date: '2026-11-17', serviceId: 'corte', barberId: joao.barber.id });
      const unavailable = slots.filter(slot => !slot.available).map(slot => slot.time.toString());
      expect(unavailable).toEqual(['09:30', '10:00', '10:30']);
    });

    it('can ignore the appointment being rescheduled', async () => {
      const { useCases, client, joao, actor } = await seedShop();
      const mine = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });

      const { slots } = await useCases.scheduling.getAvailability.execute({
        date: '2026-11-17', serviceId: 'corte', barberId: joao.barber.id, ignoreAppointmentId: mine.id,
      });
      expect(slots.every(slot => slot.available)).toBeTrue();
    });

    it('keeps a time available while another barber is free', async () => {
      const { useCases, otherClient, joao, actor } = await seedShop();
      await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });

      const { slots } = await useCases.scheduling.getAvailability.execute({ date: '2026-11-17', serviceId: 'corte' });
      expect(slots.find(slot => slot.time.toString() === '10:00')?.available).toBeTrue();
    });

    it('returns no slots on days nobody works', async () => {
      const { useCases } = await seedShop();
      const { slots } = await useCases.scheduling.getAvailability.execute({ date: '2026-11-22', serviceId: 'corte' });
      expect(slots).toEqual([]);
    });

    it('fails for unknown barbers or services', async () => {
      const { useCases } = await seedShop();
      await expectAsync(useCases.scheduling.getAvailability.execute({ date: '2026-11-17', serviceId: 'corte', barberId: 'nope' }))
        .toBeRejectedWith(jasmine.any(NotFoundError));
      await expectAsync(useCases.scheduling.getAvailability.execute({ date: '2026-11-17', serviceId: 'nope' }))
        .toBeRejectedWith(jasmine.any(NotFoundError));
    });
  });

  describe('BookAppointment', () => {
    it('books the chosen barber and notifies them', async () => {
      const { useCases, client, pedro, infra, actor } = await seedShop();
      const view = await useCases.scheduling.bookAppointment.execute(actor(client), {
        serviceId: 'combo', startsAt: tuesdayAt('09:00'), barberId: pedro.barber.id, notes: 'Degradê baixo',
      });

      expect(view.status).toBe('PENDING');
      expect(view.barber).toEqual({ id: pedro.barber.id, name: 'Pedro Silva' });
      expect(view.client.id).toBe(client.id);
      expect(view.service).toEqual({ id: 'combo', name: 'Corte + Barba', price: 65, durationMinutes: 70 });
      expect(view.endsAt).toBe('2026-11-17T13:10:00.000Z');
      expect(view.notes).toBe('Degradê baixo');
      expect(infra.notifications.published).toEqual([{
        event: 'appointment.booked',
        appointmentId: view.id,
        startsAt: view.startsAt,
        endsAt: view.endsAt,
        service: { name: 'Corte + Barba', price: 65 },
        client: { id: client.id, name: 'Ana Cliente', email: 'ana@test.com' },
        barber: { id: pedro.barber.id, name: 'Pedro Silva', email: 'pedro@shop.com' },
        occurredAt: '2026-11-16T12:00:00.000Z',
      }]);
    });

    it('assigns the first free barber when the client has no preference', async () => {
      const { useCases, client, otherClient, joao, pedro, actor } = await seedShop();
      const first = await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      const second = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });

      expect(first.barber.id).toBe(joao.barber.id);
      expect(second.barber.id).toBe(pedro.barber.id);
    });

    it('skips barbers who do not work at that time', async () => {
      const { useCases, client, infra, actor } = await seedShop();
      const saturday = await addBarber(infra, 'Aaron Sábado', 'aaron@shop.com', [{ weekday: 6, openTime: '08:00', closeTime: '12:00' }]);
      const view = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      expect(view.barber.id).not.toBe(saturday.barber.id);
    });

    it('rejects overlapping bookings for the same barber', async () => {
      const { useCases, client, otherClient, joao, actor } = await seedShop();
      await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });

      await expectAsync(useCases.scheduling.bookAppointment.execute(actor(client), {
        serviceId: 'corte', startsAt: tuesdayAt('10:20'), barberId: joao.barber.id,
      })).toBeRejectedWith(jasmine.objectContaining({ code: 'SLOT_UNAVAILABLE' }));
    });

    it('allows booking a slot freed by a cancellation', async () => {
      const { useCases, client, otherClient, joao, actor } = await seedShop();
      const taken = await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await useCases.scheduling.cancelAppointment.execute(actor(otherClient), taken.id);

      await expectAsync(useCases.scheduling.bookAppointment.execute(actor(client), {
        serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id,
      })).toBeResolved();
    });

    it('lets only one of two concurrent bookings win the same slot', async () => {
      const { useCases, client, otherClient, joao, actor } = await seedShop();
      const input = { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id };
      const results = await Promise.allSettled([
        useCases.scheduling.bookAppointment.execute(actor(client), input),
        useCases.scheduling.bookAppointment.execute(actor(otherClient), input),
      ]);
      expect(results.filter(result => result.status === 'fulfilled').length).toBe(1);
    });

    it('rejects times outside working hours or in the past', async () => {
      const { useCases, client, joao, actor } = await seedShop();
      await expectAsync(useCases.scheduling.bookAppointment.execute(actor(client), {
        serviceId: 'corte', startsAt: tuesdayAt('17:40'), barberId: joao.barber.id,
      })).toBeRejectedWith(jasmine.any(ConflictError));
      await expectAsync(useCases.scheduling.bookAppointment.execute(actor(client), {
        serviceId: 'corte', startsAt: new Date('2026-11-16T11:00:00.000Z'), barberId: joao.barber.id,
      })).toBeRejectedWith(jasmine.any(ValidationError));
    });

    it('rejects inactive services', async () => {
      const { useCases, client, actor } = await seedShop();
      await useCases.catalog.updateServiceOffering.execute('corte', { active: false });
      await expectAsync(useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') }))
        .toBeRejectedWith(jasmine.any(NotFoundError));
    });
  });

  describe('RescheduleAppointment', () => {
    it('moves the appointment and returns it to pending', async () => {
      const { useCases, client, joao, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await useCases.scheduling.changeAppointmentStatus.execute(actor(joao.user), booked.id, 'CONFIRMED');

      const moved = await useCases.scheduling.rescheduleAppointment.execute(actor(client), booked.id, { serviceId: 'combo', startsAt: tuesdayAt('14:00') });
      expect(moved.status).toBe('PENDING');
      expect(moved.service.id).toBe('combo');
      expect(moved.startsAt).toBe(tuesdayAt('14:00').toISOString());
    });

    it('may overlap its own previous time', async () => {
      const { useCases, client, joao, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await expectAsync(useCases.scheduling.rescheduleAppointment.execute(actor(client), booked.id, { startsAt: tuesdayAt('10:30') })).toBeResolved();
    });

    it('rejects a time taken by someone else', async () => {
      const { useCases, client, otherClient, joao, actor } = await seedShop();
      const mine = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('14:00'), barberId: joao.barber.id });

      await expectAsync(useCases.scheduling.rescheduleAppointment.execute(actor(client), mine.id, { startsAt: tuesdayAt('14:00') }))
        .toBeRejectedWith(jasmine.objectContaining({ code: 'SLOT_UNAVAILABLE' }));
    });

    it('forbids changing another client appointment', async () => {
      const { useCases, client, otherClient, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      await expectAsync(useCases.scheduling.rescheduleAppointment.execute(actor(otherClient), booked.id, { startsAt: tuesdayAt('11:00') }))
        .toBeRejectedWith(jasmine.any(ForbiddenError));
    });

    it('fails for unknown appointments', async () => {
      const { useCases, client, actor } = await seedShop();
      await expectAsync(useCases.scheduling.rescheduleAppointment.execute(actor(client), 'missing', { startsAt: tuesdayAt('11:00') }))
        .toBeRejectedWith(jasmine.any(NotFoundError));
    });
  });

  describe('ChangeAppointmentStatus', () => {
    it('lets the assigned barber confirm and notifies the client', async () => {
      const { useCases, client, joao, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });

      const view = await useCases.scheduling.changeAppointmentStatus.execute(actor(joao.user), booked.id, 'CONFIRMED');
      expect(view.status).toBe('CONFIRMED');
      expect(infra.notifications.published.at(-1)).toEqual(jasmine.objectContaining({
        event: 'appointment.confirmed', client: jasmine.objectContaining({ id: client.id }),
      }));
    });

    it('notifies the client when staff cancels', async () => {
      const { useCases, client, admin, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });

      await useCases.scheduling.changeAppointmentStatus.execute(actor(admin), booked.id, 'CANCELED');
      expect(infra.notifications.published.at(-1)?.event).toBe('appointment.canceled_by_barber');
    });

    it('does not notify when completing', async () => {
      const { useCases, client, admin, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      await useCases.scheduling.changeAppointmentStatus.execute(actor(admin), booked.id, 'CONFIRMED');
      const published = infra.notifications.published.length;

      await useCases.scheduling.changeAppointmentStatus.execute(actor(admin), booked.id, 'COMPLETED');
      expect(infra.notifications.published.length).toBe(published);
    });

    it('forbids barbers from deciding on other barbers appointments', async () => {
      const { useCases, client, joao, pedro, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await expectAsync(useCases.scheduling.changeAppointmentStatus.execute(actor(pedro.user), booked.id, 'CONFIRMED'))
        .toBeRejectedWith(jasmine.any(ForbiddenError));
    });

    it('rejects invalid transitions', async () => {
      const { useCases, client, admin, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      await expectAsync(useCases.scheduling.changeAppointmentStatus.execute(actor(admin), booked.id, 'COMPLETED'))
        .toBeRejectedWith(jasmine.objectContaining({ code: 'INVALID_STATUS_TRANSITION' }));
    });
  });

  describe('CancelAppointment', () => {
    it('lets the client cancel their own appointment', async () => {
      const { useCases, client, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      await useCases.scheduling.cancelAppointment.execute(actor(client), booked.id);
      expect((await infra.appointments.findById(booked.id))?.status).toBe('CANCELED');
    });

    it('notifies the barber when the client cancels', async () => {
      const { useCases, client, joao, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await useCases.scheduling.cancelAppointment.execute(actor(client), booked.id);
      expect(infra.notifications.published.at(-1)).toEqual(jasmine.objectContaining({
        event: 'appointment.canceled_by_client', barber: { id: joao.barber.id, name: 'João Mestre', email: 'joao@shop.com' },
      }));
    });

    it('notifies the client when staff cancels through the client endpoint', async () => {
      const { useCases, client, joao, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await useCases.scheduling.cancelAppointment.execute(actor(joao.user), booked.id);
      expect(infra.notifications.published.at(-1)?.event).toBe('appointment.canceled_by_barber');
    });

    it('does not notify when the cancellation is rejected', async () => {
      const { useCases, client, otherClient, infra, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      const published = infra.notifications.published.length;
      await expectAsync(useCases.scheduling.cancelAppointment.execute(actor(otherClient), booked.id)).toBeRejected();
      expect(infra.notifications.published.length).toBe(published);
    });

    it('forbids canceling someone else appointment', async () => {
      const { useCases, client, otherClient, actor } = await seedShop();
      const booked = await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
      await expectAsync(useCases.scheduling.cancelAppointment.execute(actor(otherClient), booked.id)).toBeRejectedWith(jasmine.any(ForbiddenError));
    });
  });

  describe('ListAppointments', () => {
    it('scopes the list by role', async () => {
      const { useCases, client, otherClient, admin, joao, pedro, actor } = await seedShop();
      await useCases.scheduling.bookAppointment.execute(actor(client), { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId: joao.barber.id });
      await useCases.scheduling.bookAppointment.execute(actor(otherClient), { serviceId: 'corte', startsAt: tuesdayAt('11:00'), barberId: pedro.barber.id });

      expect((await useCases.scheduling.listAppointments.execute(actor(client))).map(a => a.client.id)).toEqual([client.id]);
      expect((await useCases.scheduling.listAppointments.execute(actor(pedro.user))).map(a => a.barber.id)).toEqual([pedro.barber.id]);
      expect((await useCases.scheduling.listAppointments.execute(actor(admin))).length).toBe(2);
    });

    it('rejects barber accounts without a barber profile', async () => {
      const { useCases } = await seedShop();
      await expectAsync(useCases.scheduling.listAppointments.execute({ userId: 'ghost', role: 'BARBER' }))
        .toBeRejectedWith(jasmine.any(ForbiddenError));
    });
  });

  describe('schedules', () => {
    it('lists every barber schedule', async () => {
      const { useCases } = await seedShop();
      const schedules = await useCases.scheduling.listSchedules.execute();
      expect(schedules.length).toBe(2);
      expect(schedules[0].workingDays.map(day => day.weekday)).toEqual([1, 2, 3, 4, 5]);
    });

    it('lets a barber read and replace their own week', async () => {
      const { useCases, joao, actor } = await seedShop();
      await useCases.scheduling.updateBarberSchedule.executeForSelf(actor(joao.user), [{ weekday: 6, openTime: '09:00', closeTime: '13:00' }]);

      const schedule = await useCases.scheduling.getMySchedule.execute(actor(joao.user));
      expect(schedule.workingDays.map(day => `${day.weekday} ${day.opensAt}-${day.closesAt}`)).toEqual(['6 09:00-13:00']);
    });

    it('lets admins edit any barber but not barbers edit each other', async () => {
      const { useCases, admin, joao, pedro, actor } = await seedShop();
      await expectAsync(useCases.scheduling.updateBarberSchedule.execute(actor(admin), pedro.barber.id, [])).toBeResolved();
      await expectAsync(useCases.scheduling.updateBarberSchedule.execute(actor(joao.user), pedro.barber.id, []))
        .toBeRejectedWith(jasmine.any(ForbiddenError));
      await expectAsync(useCases.scheduling.updateBarberSchedule.execute(actor(admin), 'missing', []))
        .toBeRejectedWith(jasmine.any(NotFoundError));
    });

    it('reports a missing barber profile for staff without one', async () => {
      const { useCases, admin, actor } = await seedShop();
      await expectAsync(useCases.scheduling.getMySchedule.execute(actor(admin))).toBeRejectedWith(jasmine.any(NotFoundError));
    });
  });
});
