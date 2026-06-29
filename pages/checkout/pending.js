/**
 * pages/checkout/pending.js
 * Pantalla de retorno cuando el pago quedó pendiente de acreditación
 * (ej: pago en efectivo / Rapipago / Pago Fácil vía MercadoPago).
 */
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const F = "#0D3B1F", V = "#16A34A";

export default function CheckoutPending() {
  return (
    <>
      <Head><title>Pago en proceso · OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "48px 20px 80px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 44 }}>⏳</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: F, margin: "0 0 10px", fontFamily: "Georgia,serif" }}>Pago en proceso</h1>
          <p style={{ color: "#6B7C6E", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
            Estamos esperando la confirmación de tu pago. Te avisamos apenas se acredite — puede tardar unos minutos según el medio que elegiste.
          </p>

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
