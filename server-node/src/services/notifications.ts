import { generateId, readJson, writeJson } from "../storage.js";
import { ProviderNotification } from "../types.js";
import { queuePushNotification } from "./push.js";

const PROVIDER_NOTIFICATIONS_KEY = "provider_notifications";

const read = () => readJson<ProviderNotification[]>(PROVIDER_NOTIFICATIONS_KEY, []);
const save = (items: ProviderNotification[]) => writeJson(PROVIDER_NOTIFICATIONS_KEY, items);

export const appendNotification = (notification: ProviderNotification) => {
  const all = read();
  all.push(notification);
  save(all);
  return notification;
};

export const markNotification = (providerId: string, notificationId: string, readFlag: boolean) => {
  const all = read();
  let updated = false;
  for (const notif of all) {
    if (notif.providerId === providerId && notif.id === notificationId) {
      notif.read = readFlag;
      updated = true;
    }
  }
  if (updated) save(all);
  return updated;
};

export const markAllNotifications = (providerId: string) => {
  const all = read();
  let changed = false;
  for (const notif of all) {
    if (notif.providerId === providerId && !notif.read) {
      notif.read = true;
      changed = true;
    }
  }
  if (changed) save(all);
  return changed;
};

export const listNotifications = (providerId: string, unreadOnly: boolean, limit: number) => {
  const items = read()
    .filter((notif) => notif.providerId === providerId && (!unreadOnly || !notif.read))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, Math.max(Math.min(limit, 200), 1));
  const unreadCount = read().filter((notif) => notif.providerId === providerId && !notif.read).length;
  return { items, unreadCount };
};

export const buildNotification = (
  providerId: string,
  title: string,
  message: string,
  payload?: Record<string, unknown>,
): ProviderNotification => {
  const notification: ProviderNotification = {
    id: generateId("notif_"),
    providerId,
    type: "SYSTEM",
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  if (payload) {
    notification.payload = payload;
  }
  return notification;
};

export const notifyProviderRequestCreated = (request: any) => {
  const services = readJson<any[]>("provider_services", []);
  const service = services.find((srv) => srv.id === request.serviceId);
  const catalog = readJson<any[]>("catalog", []);
  if (service && !service.catalog && service.catalogId) {
    service.catalog = catalog.find((item) => item.id === service.catalogId) || null;
  }
  const users = readJson<any[]>("users", []);
  const client = users.find((u) => u.id === request.clientId);

  const scheduleLabel =
    request.schedule?.label || request.schedule?.timeSlot || request.schedule?.date || "Sin horario asignado";
  const title = request.schedule?.urgent ? "Nueva urgencia recibida" : "Nueva solicitud de servicio";
  const messageParts = [service?.catalog?.nombre || service?.notes || "Servicio sin titulo", scheduleLabel].filter(Boolean);

  const notification: ProviderNotification = {
    id: generateId("notif_"),
    providerId: request.providerId,
    type: "REQUEST_CREATED",
    title,
    message: messageParts.join(" - "),
    payload: {
      requestId: request.id,
      serviceId: request.serviceId,
      clientId: request.clientId,
      clientName: client?.name || client?.email || null,
      schedule: request.schedule || null,
    },
    read: false,
    createdAt: new Date().toISOString(),
  };

  appendNotification(notification);
  queuePushNotification(request.providerId, {
    title: notification.title,
    body: notification.message,
    data: notification.payload || {},
  });
  return notification;
};
