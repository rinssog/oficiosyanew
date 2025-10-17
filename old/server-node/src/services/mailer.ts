export interface MailPayload {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, unknown>;
}

export const queueTransactionalEmail = (payload: MailPayload) => ({
  id: `mail_${Math.random().toString(36).slice(2, 10)}`,
  enqueuedAt: new Date().toISOString(),
  ...payload,
});
