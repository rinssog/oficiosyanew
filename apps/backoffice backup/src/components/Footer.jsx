"use client";

import Link from "next/link";

const footerStyle = {
  background: "var(--panel)",
  borderTop: "1px solid var(--border)",
  marginTop: "72px",
  padding: "32px clamp(20px, 5vw, 72px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 18,
};

const companyBlock = {
  textAlign: "right",
  color: "var(--text-soft)",
  fontSize: 14,
  lineHeight: 1.5,
};

const linksRow = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: 18,
  color: "var(--primary-700)",
  fontWeight: 600,
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={footerStyle}>
      <div style={companyBlock}>
        <strong style={{ color: "var(--primary-700)", fontSize: 18 }}>OficiosYa SAS</strong>
        <p style={{ margin: "4px 0 0" }}>CUIT 30-71914721-2</p>
        <p style={{ margin: 0 }}>Echeverría 1437 PB, Belgrano, CABA · CP 1428</p>
        <p style={{ margin: 0 }}>atencion.oficiosya@gmail.com · +54 11 5555-5555</p>
      </div>
      <div style={linksRow}>
        <Link href="/terminos">Términos y condiciones</Link>
        <Link href="/politica-privacidad">Política de privacidad</Link>
        <Link href="/soporte">Centro de ayuda</Link>
        <Link href="/contacto">Contacto comercial</Link>
      </div>
      <small style={{ color: "#6b8573" }}>
        © {year} OficiosYa SAS · Intermediación segura para clientes, prestadores y consorcios.
      </small>
    </footer>
  );
}

