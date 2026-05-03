/**
 * components/InstallBanner.jsx
 * Banner que aparece en mobile invitando a instalar la app
 * Usar en el NavBar o en la Landing
 *
 * Uso:
 *   import InstallBanner from "./InstallBanner";
 *   <InstallBanner />
 */
import { useState, useEffect } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

const F = "#0D3B1F", V = "#16A34A";

export default function InstallBanner() {
  const { canInstall, installPWA, isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mobile = window.innerWidth < 768;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsMobile(mobile);
    setIsIOS(ios);
    // Leer si fue descartado antes
    const disc = localStorage.getItem("oya_install_dismissed");
    if (disc) setDismissed(true);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("oya_install_dismissed", "1");
  };

  // No mostrar si: no mobile, ya instalado, descartado, ni en iOS sin guía
  if (!isMobile || isInstalled || dismissed) return null;

  // iOS: Chrome no dispara beforeinstallprompt → mostramos guía manual
  if (isIOS && !canInstall) {
    if (!showIOSGuide) {
      return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: F, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 9999, boxShadow: "0 -4px 20px rgba(0,0,0,0.3)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Instalá OficiosYa en tu iPhone</div>
            <div style={{ color: "#BBF7D0", fontSize: 12, marginTop: 2 }}>Tocá para ver cómo</div>
          </div>
          <button onClick={() => setShowIOSGuide(true)} style={{ background: V, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cómo</button>
          <button onClick={dismiss} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 20, cursor: "pointer", padding: "0 4px" }}>×</button>
        </div>
      );
    }
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "flex-end" }}>
        <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%" }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: F, marginBottom: 16 }}>Instalá OficiosYa en tu iPhone</div>
          {[
            ["1", 'Tocá el botón compartir (cuadrado con flecha ↑) en la barra de Safari'],
            ["2", 'Desplazate y tocá "Agregar a pantalla de inicio"'],
            ["3", 'Tocá "Agregar" en la esquina superior derecha'],
          ].map(([n, t]) => (
            <div key={n} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: V, color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, marginTop: 4 }}>{t}</div>
            </div>
          ))}
          <button onClick={() => { setShowIOSGuide(false); dismiss(); }} style={{ width: "100%", background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}>Entendido</button>
        </div>
      </div>
    );
  }

  // Android o Desktop Chrome: usar el prompt nativo
  if (!canInstall) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: F, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 9999, boxShadow: "0 -4px 20px rgba(0,0,0,0.3)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Instalá OficiosYa</div>
        <div style={{ color: "#BBF7D0", fontSize: 12, marginTop: 2 }}>Accedé más rápido desde tu home screen</div>
      </div>
      <button onClick={async () => { const ok = await installPWA(); if (ok) dismiss(); }} style={{ background: V, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        Instalar
      </button>
      <button onClick={dismiss} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 20, cursor: "pointer", padding: "0 4px" }}>×</button>
    </div>
  );
}
