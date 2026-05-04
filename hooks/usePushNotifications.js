/**
 * hooks/usePushNotifications.js
 * Suscribe al usuario a notificaciones push via Web Push (VAPID)
 *
 * Uso:
 *   const { enabled, requestPermission, isSupported } = usePushNotifications();
 */
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { apiRequest, user } = useAuth();
  const [enabled,     setEnabled]     = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
    setEnabled(Notification.permission === "granted");
  }, []);

  const requestPermission = async () => {
    if (!isSupported || !user) return false;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setLoading(false); return false; }

      // Obtener clave pública VAPID del backend
      const keyRes = await fetch(`${API}/api/push/vapid-public-key`);
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error("VAPID key no disponible");

      // Registrar Service Worker y suscribir
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Enviar suscripción al backend
      await apiRequest("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      setEnabled(true);
      return true;
    } catch(e) {
      console.error("[Push]", e);
      return false;
    } finally { setLoading(false); }
  };

  const disable = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiRequest("/api/push/subscribe", {
          method: "DELETE",
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
    } catch(e) { console.error("[Push disable]", e); }
  };

  return { enabled, isSupported, loading, requestPermission, disable };
}
