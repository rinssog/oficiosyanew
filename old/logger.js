export const logger = {
  info(message, context) {
    const ts = new Date().toISOString();
    const payload = context ? `${message} :: ${JSON.stringify(context)}` : message;
    console.log(`[${ts}] [INFO] ${payload}`);
  },
  warn(message, context) {
    const ts = new Date().toISOString();
    const payload = context ? `${message} :: ${JSON.stringify(context)}` : message;
    console.warn(`[${ts}] [WARN] ${payload}`);
  },
  error(message, context) {
    const ts = new Date().toISOString();
    const payload = context ? `${message} :: ${JSON.stringify(context)}` : message;
    console.error(`[${ts}] [ERROR] ${payload}`);
  },
};
