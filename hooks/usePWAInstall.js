/**
 * hooks/usePWAInstall.js — Prompt de instalación PWA
 * Uso: const { canInstall, installPWA, isInstalled } = usePWAInstall();
 */
import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall,     setCanInstall]     = useState(false);
  const [isInstalled,    setIsInstalled]    = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setIsInstalled(!!standalone);

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setCanInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setCanInstall(false); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null); setCanInstall(false);
    return outcome === "accepted";
  };

  return { canInstall, installPWA, isInstalled };
}
