export type LogLevel = "info" | "warn" | "error";

type LogMethod = (message: string, context?: Record<string, unknown>) => void;

const format = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  const payload = context && Object.keys(context).length > 0 ? `${message} :: ${JSON.stringify(context)}` : message;
  return `[${timestamp}] [${level.toUpperCase()}] ${payload}`;
};

const log = (level: LogLevel): LogMethod => (message, context) => {
  const payload = format(level, message, context);
  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.log(payload);
  }
};

export const logger = {
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
};
