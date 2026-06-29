/**
 * pages/checkout/failure.js
 * Pantalla de retorno cuando el pago fue rechazado o cancelado.
 */
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const F = "#0D3B1F", V = "#16A34A";

export default function CheckoutFailure() {
  const router = useRouter();

  return (
    <>
      <Head><title>El pago no se completó · OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "48px 20px 80px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 44 }}>⚠️</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: F, margin: "0 0 10px", fontFamily: "Georgia,serif" }}>El pago no se completó</h1>
          <p style={{ color: "#6B7C6E", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
            No se realizó ningún cargo. Podés intentar de nuevo o elegir otro medio de pago.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => router.back()} style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Intentar de nuevo
            </button>
            <Link href="/client/dashboard" style={{ color: V, fontWeight: 700, fontSize: 14, padding: 8, textDecoration: "none" }}>
              Ir a mis solicitudes
            </Link>
            <Link href="/soporte" style={{ color: "#9CA3AF", fontWeight: 600, fontSize: 13, padding: 4, textDecoration: "none" }}>
              ¿Necesitás ayuda? Contactá soporte
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
