export type LogContext = Record<string, unknown> | undefined;

const format = (level: string, message: string, context?: LogContext) => {
  const ts = new Date().toISOString();
  const payload = context && Object.keys(context).length > 0 ? `${message} :: ${JSON.stringify(context)}` : message;
  return `[${ts}] [${level}] ${payload}`;
};

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(format('INFO', message, context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(format('WARN', message, context));
  },
  error(message: string, context?: LogContext) {
    console.error(format('ERROR', message, context));
  },
};
