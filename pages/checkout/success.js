/**
 * pages/checkout/success.js
 * Pantalla de retorno cuando el pago fue aprobado (MercadoPago auto_return).
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

export default function CheckoutSuccess() {
  const router = useRouter();
  const { apiRequest, isReady, user } = useAuth();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    if (!isReady || !user) return;
    const paymentId = router.query.payment;
    if (!paymentId) return;
    apiRequest(`/api/payments/${paymentId}`)
      .then((d) => setAttempt(d.attempt || null))
      .catch(() => {});
  }, [isReady, user, router.query.payment, apiRequest]);

  const total = attempt ? (Number(attempt.base || 0) + Number(attempt.platformFee || 0)) : null;

  return (
    <>
      <Head><title>Pago confirmado · OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "48px 20px 80px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 44 }}>✅</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: F, margin: "0 0 10px", fontFamily: "Georgia,serif" }}>¡Pago confirmado!</h1>
          <p style={{ color: "#6B7C6E", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
            Tu pago se procesó correctamente. El prestador fue notificado y se va a poner en contacto para coordinar.
          </p>

          {total != null && (
            <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "18px 20px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6B7C6E" }}>
                <span>Total pagado</span>
                <strong style={{ color: F, fontSize: 18 }}>${total.toLocaleString("es-AR")}</strong>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/client/dashboard" style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
              Ver mis solicitudes
            </Link>
            <Link href="/" style={{ color: V, fontWeight: 700, fontSize: 14, padding: 8, textDecoration: "none" }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
