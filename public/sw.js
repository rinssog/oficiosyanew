/**
 * public/sw.js — Service Worker OficiosYa PWA v2
 * Estrategia: Network First → Cache → Offline fallback
 */

const CACHE_NAME = "oficiosya-v2";
const OFFLINE_URL = "/offline";

// Solo cachear recursos que existen — sin PNGs que no están en /public
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/auth/login",
  "/auth/register",
  "/manifest.json",
  "/favicon.svg",
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll individual para que un 404 no rompa toda la instalación
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pasar sin interceptar: API, externos, no-GET
  if (url.pathname.startsWith("/api/")) return;
  if (url.origin !== location.origin) return;
  if (request.method !== "GET") return;

  // Estrategia: Network First con fallback a cache y offline
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
        if (request.destination === "document") {
          const offline = await caches.match(OFFLINE_URL);
          return (
            offline ||
            new Response("<h1>Sin conexión</h1><p>Verificá tu red y recargá.</p>", {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
          );
        }
        return new Response("", { status: 503 });
      })
  );
});

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  const { title = "OficiosYa", body = "", url = "/", icon = "/favicon.svg" } = payload;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/favicon.svg",
      data: { url },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "Ver" },
        { action: "dismiss", title: "Cerrar" },
      ],
    })
  );
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url === url && "focus" in c);
        if (existing) return existing.focus();
        return clients.openWindow(url);
      })
  );
});
