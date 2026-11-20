/** Base class for every business rule violation. HTTP status mapping lives in the delivery layer. */
export abstract class DomainError extends Error {
  protected constructor(readonly code: string, message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(code, message);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super('NOT_FOUND', `${entity} não encontrado`);
  }
}

export class ConflictError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Permissão insuficiente') {
    super('FORBIDDEN', message);
  }
}

export class AuthenticationError extends DomainError {
  constructor(code = 'INVALID_CREDENTIALS', message = 'Email ou senha inválidos') {
    super(code, message);
  }
}
