export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const queuePushNotification = (providerId: string, payload: PushNotificationPayload) => {
  // TODO: integrar web push real
  return { providerId, payload, enqueuedAt: new Date().toISOString() };
};
