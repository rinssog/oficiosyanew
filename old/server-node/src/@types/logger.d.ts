
declare module "./utils/logger.js" {
  export type LogContext = Record<string, unknown> | undefined;
  export const logger: {
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
  };
}

