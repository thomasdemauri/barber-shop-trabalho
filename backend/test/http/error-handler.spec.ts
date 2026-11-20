import Fastify from 'fastify';
import { z } from 'zod';
import { registerErrorHandler, statusFor } from '../../src/shared/http/error-handler.js';
import { AuthenticationError, ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../src/shared/domain/errors.js';

describe('error handler', () => {
  it('maps each domain error type to its status code', () => {
    expect(statusFor(new ValidationError('x'))).toBe(400);
    expect(statusFor(new AuthenticationError())).toBe(401);
    expect(statusFor(new ForbiddenError())).toBe(403);
    expect(statusFor(new NotFoundError('X'))).toBe(404);
    expect(statusFor(new ConflictError('C', 'x'))).toBe(409);
  });

  it('hides unexpected errors behind a generic 500', async () => {
    const app = Fastify();
    registerErrorHandler(app);
    app.get('/boom', async () => { throw new Error('database password is hunter2'); });
    app.get('/invalid', async () => z.object({ a: z.string() }).parse({}));

    const boom = await app.inject({ method: 'GET', url: '/boom' });
    expect(boom.statusCode).toBe(500);
    expect(JSON.parse(boom.body)).toEqual({ error: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });

    const invalid = await app.inject({ method: 'GET', url: '/invalid' });
    expect(invalid.statusCode).toBe(400);
    expect(JSON.parse(invalid.body).details.fieldErrors.a).toBeDefined();
    await app.close();
  });

  it('keeps framework client errors such as malformed JSON as 4xx', async () => {
    const app = Fastify();
    registerErrorHandler(app);
    app.post('/echo', async request => request.body);
    const response = await app.inject({ method: 'POST', url: '/echo', headers: { 'content-type': 'application/json' }, payload: '{bad' });
    expect(response.statusCode).toBe(400);
    await app.close();
  });
});
