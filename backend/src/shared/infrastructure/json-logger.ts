type Level = 'info' | 'warn' | 'error';

const serialise = (data: object) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) =>
    [key, value instanceof Error ? { name: value.name, message: value.message } : value]));

function write(level: Level, data: object, message: string) {
  const line = JSON.stringify({ level, time: new Date().toISOString(), msg: message, ...serialise(data) });
  (level === 'error' ? console.error : console.log)(line);
}

/** One JSON line per entry, matching the API's Fastify/pino log shape. */
export const jsonLogger = {
  info: (data: object, message: string) => write('info', data, message),
  warn: (data: object, message: string) => write('warn', data, message),
  error: (data: object, message: string) => write('error', data, message),
};
