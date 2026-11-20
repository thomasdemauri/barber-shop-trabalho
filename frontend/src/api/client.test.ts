import { describe, expect, it } from 'vitest';
import { HttpResponseError, mockApi } from '../test/api-mock';
import { apiAppointment } from '../test/fixtures';
import { ApiError, errorMessage, request, tokenStore } from './client';
import { appointmentsApi, schedulingApi } from './endpoints';

describe('api client', () => {
  it('sends JSON bodies and the stored bearer token', async () => {
    const api = mockApi({ 'POST /things': { ok: true } });
    tokenStore.set('abc');

    await expect(request('/things', { method: 'POST', body: { a: 1 } })).resolves.toEqual({ ok: true });
    const [call] = api.callsTo('POST', '/things');
    expect(call.body).toEqual({ a: 1 });
    expect(call.headers.get('Authorization')).toBe('Bearer abc');
    expect(call.headers.get('Content-Type')).toBe('application/json');
  });

  it('omits the token when logged out and skips undefined query params', async () => {
    const api = mockApi({ 'GET /availability': { date: '2030-01-15', slots: [] } });
    await schedulingApi.availability({ date: '2030-01-15', serviceId: 'corte', barberId: undefined });

    const [call] = api.callsTo('GET', '/availability');
    expect(call.headers.has('Authorization')).toBe(false);
    expect([...call.query.keys()]).toEqual(['date', 'serviceId']);
  });

  it('turns error responses into ApiError with the server code and message', async () => {
    mockApi({ 'POST /appointments': () => { throw new HttpResponseError(409, { error: 'SLOT_UNAVAILABLE', message: 'Horário indisponível' }); } });

    const error = await appointmentsApi.book({ serviceId: 's', startsAt: 'x' }).catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: 'SLOT_UNAVAILABLE', message: 'Horário indisponível' });
    expect(errorMessage(error, 'fallback')).toBe('Horário indisponível');
    expect(errorMessage('weird', 'fallback')).toBe('fallback');
  });

  it('resolves empty responses to undefined', async () => {
    mockApi({ 'DELETE /appointments/a-1': undefined });
    await expect(appointmentsApi.cancel('a-1')).resolves.toBeUndefined();
  });

  it('maps API appointment statuses to lowercase', async () => {
    mockApi({ 'GET /appointments': [apiAppointment({ status: 'CONFIRMED' })] });
    const [appointment] = await appointmentsApi.list();
    expect(appointment.status).toBe('confirmed');
  });

  it('stores and clears the token', () => {
    tokenStore.set('t');
    expect(tokenStore.get()).toBe('t');
    tokenStore.set(null);
    expect(tokenStore.get()).toBeNull();
  });
});
