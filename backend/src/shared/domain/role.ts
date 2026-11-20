export const ROLES = ['CLIENT', 'BARBER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const isStaff = (role: Role) => role !== 'CLIENT';
