import { z } from 'zod';

export const parse = <T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> => schema.parse(value);

export const idParams = z.object({ id: z.string().min(1) });
export const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve estar no formato HH:MM');
export const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD');
