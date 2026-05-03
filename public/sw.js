/**
 * public/sw.js — Service Worker para OficiosYa PWA
 * Habilita: instalación en home screen, caché offline, notificaciones push
 */

const CACHE_NAME = "oficiosya-v1";
const OFFLINE_URL = "/offline";

// Recursos que se cachean al instalar
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/client/buscar",
  "/planes",
  "/auth/login",
  "/auth/registro",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar llamadas a la API
  if (url.pathname.startsWith("/api/")) return;
  if (request.method !== "GET") return;

  // Estrategia: Network First → Cache → Offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Si es navegación, mostrar página offline
        if (request.destination === "document") {
          const offline = await caches.match(OFFLINE_URL);
          return offline || new Response("Sin conexión", { status: 503 });
        }
        return new Response("", { status: 503 });
      })
  );
});

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); } catch { return; }

  const { title, body, url, icon } = payload;
  event.waitUntil(
    self.registration.showNotification(title || "OficiosYa", {
      body: body || "",
      icon: icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data: { url: url || "/" },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "Ver" },
        { action: "dismiss", title: "Cerrar" },
      ],
    })
  );
});

// ─── NOTIFICATION CLICK ──────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url === url && "focus" in c);
        if (existing) return existing.focus();
        return clients.openWindow(url);
      })
  );
});
