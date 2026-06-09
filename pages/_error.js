/**
 * pages/_error.js — Error global de aplicación
 */
import Head from "next/head";
import Link from "next/link";

const F = "#0D3B1F", V = "#16A34A";

function ErrorPage({ statusCode }) {
  const is500 = statusCode === 500;

  return (
    <>
      <Head>
        <title>{statusCode ? `Error ${statusCode}` : "Error"} · OficiosYa</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main
        style={{
          minHeight: "100vh",
          background: "#F7F9F5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          textAlign: "center",
          fontFamily: "system-ui,sans-serif",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>{is500 ? "⚙️" : "🔌"}</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#D4E0D6", marginBottom: 8, lineHeight: 1 }}>
          {statusCode || "ERR"}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 12px" }}>
          {is500
            ? "Error interno del servidor"
            : statusCode === 503
            ? "Servicio no disponible"
            : "Ocurrió un error"}
        </h1>
        <p style={{ color: "#6B7C6E", fontSize: 14, marginBottom: 28, maxWidth: 360, lineHeight: 1.6 }}>
          {is500
            ? "El equipo ya fue notificado. Por favor intentá de nuevo en unos minutos."
            : "Algo salió mal. Recargá la página o volvé al inicio."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: `linear-gradient(135deg,${V},${F})`,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🔄 Recargar página
          </button>
          <Link href="/">
            <button
              style={{
                background: "#fff",
                color: F,
                border: `2px solid #D4E0D6`,
                borderRadius: 14,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Ir al inicio
            </button>
          </Link>
        </div>
        <div style={{ marginTop: 32, fontSize: 12, color: "#9CA3AF" }}>
          Si el problema persiste:{" "}
          <a href="mailto:atencion@oficiosya.com.ar" style={{ color: V }}>
            atencion@oficiosya.com.ar
          </a>
        </div>
      </main>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
