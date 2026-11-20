import { ValidationError } from '../../../shared/domain/errors.js';
import { newId } from '../../../shared/domain/id.js';
import type { Role } from '../../../shared/domain/role.js';

export type UserProps = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: Role;
  createdAt: Date;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

function validName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new ValidationError('Nome deve ter ao menos 2 caracteres');
  return trimmed;
}

function validEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalized)) throw new ValidationError('Email inválido');
  return normalized;
}

const validPhone = (phone: string | null | undefined) => {
  const digits = phone?.replace(/\D/g, '') ?? '';
  return digits.length > 0 ? digits : null;
};

export class User {
  private constructor(private props: UserProps) {}

  static register(input: { name: string; email: string; phone?: string | null; passwordHash: string; now: Date }) {
    return new User({
      id: newId(),
      name: validName(input.name),
      email: validEmail(input.email),
      phone: validPhone(input.phone),
      passwordHash: input.passwordHash,
      role: 'CLIENT',
      createdAt: input.now,
    });
  }

  static restore(props: UserProps) {
    return new User({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get phone() { return this.props.phone; }
  get passwordHash() { return this.props.passwordHash; }
  get role() { return this.props.role; }
  get createdAt() { return this.props.createdAt; }

  updateContact(changes: { name?: string; email?: string; phone?: string | null }) {
    if (changes.name !== undefined) this.props.name = validName(changes.name);
    if (changes.email !== undefined) this.props.email = validEmail(changes.email);
    if (changes.phone !== undefined) this.props.phone = validPhone(changes.phone);
  }

  changePasswordHash(passwordHash: string) {
    this.props.passwordHash = passwordHash;
  }

  toSnapshot(): UserProps {
    return { ...this.props };
  }
}
