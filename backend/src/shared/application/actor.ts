import type { Role } from '../domain/role.js';

/** The authenticated user performing a use case. */
export type Actor = { userId: string; role: Role };
