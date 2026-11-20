import type { FastifyError, FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import {
  AuthenticationError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../domain/errors.js';

const STATUS_BY_ERROR: Array<[new (...args: never[]) => DomainError, number]> = [
  [ValidationError, 400],
  [AuthenticationError, 401],
  [ForbiddenError, 403],
  [NotFoundError, 404],
  [ConflictError, 409],
];

export function statusFor(error: DomainError) {
  return STATUS_BY_ERROR.find(([type]) => error instanceof type)?.[1] ?? 400;
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.flatten() });
    }
    if (error instanceof DomainError) {
      return reply.code(statusFor(error)).send({ error: error.code, message: error.message });
    }
    const status = (error as FastifyError).statusCode;
    if (status && status < 500) {
      return reply.code(status).send({ error: (error as FastifyError).code ?? 'BAD_REQUEST', message: error.message });
    }
    request.log.error({ err: error }, 'request failed');
    return reply.code(500).send({ error: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });
  });
}
