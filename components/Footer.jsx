/**
 * components/Footer.jsx
 */
import Link from "next/link";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

export default function Footer() {
  return (
    <footer style={{ background: F, color: "#9CA3AF", fontSize: 13, fontFamily: "system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>

        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <svg width="28" height="33" viewBox="0 0 80 94" fill="none">
              <defs>
                <linearGradient id="ff" x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#16A34A"/><stop offset="1" stopColor="#0D3B1F"/>
                </linearGradient>
                <linearGradient id="fg" x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FAF0B0"/><stop offset="50%" stopColor="#C9A227"/><stop offset="100%" stopColor="#FAF0B0"/>
                </linearGradient>
              </defs>
              <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill="url(#fg)"/>
              <path d="M40 5.5 L74.5 18 L74.5 48 C74.5 68 60 81 40 89 C20 81 5.5 68 5.5 48 L5.5 18 Z" fill={F} opacity="0.5"/>
              <path d="M40 8 L72 20.5 L72 48 C72 66.5 58 79 40 86.5 C22 79 8 66.5 8 48 L8 20.5 Z" fill="url(#fg)"/>
              <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill="url(#ff)"/>
              <text x="40" y="55" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Georgia,serif">Ya</text>
            </svg>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 17, fontFamily: "Georgia,serif" }}>OficiosYa</span>
          </div>
          <p style={{ lineHeight: 1.6, maxWidth: 220 }}>
            La plataforma argentina que conecta clientes con prestadores de servicios verificados.
          </p>
          <p style={{ marginTop: 10, fontSize: 12 }}>📍 Ciudad Autónoma de Buenos Aires</p>
        </div>

        {/* Servicios */}
        <div>
          <div style={{ color: G, fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Servicios</div>
          {[["Buscar prestador","/client/buscar"],["Urgencias 24/7","/client/buscar?urgente=true"],["Solicitar servicio","/solicitar"],["Planes y precios","/planes"]].map(([t,h])=>(
            <div key={t} style={{ marginBottom: 8 }}><Link href={h} style={{ color: "#9CA3AF", textDecoration: "none" }}>{t}</Link></div>
          ))}
        </div>

        {/* Prestadores */}
        <div>
          <div style={{ color: G, fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Prestadores</div>
          {[["Registrarme","/auth/registro?role=PROVIDER"],["Ver planes","/planes"],["Panel de trabajo","/providers/dashboard"],["Verificación","/providers/verificacion"]].map(([t,h])=>(
            <div key={t} style={{ marginBottom: 8 }}><Link href={h} style={{ color: "#9CA3AF", textDecoration: "none" }}>{t}</Link></div>
          ))}
        </div>

        {/* Legal */}
        <div>
          <div style={{ color: G, fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Legal</div>
          {[["Términos y Condiciones","/terminos"],["Política de Privacidad","/politica-privacidad"],["Defensa del Consumidor","https://www.argentina.gob.ar/defensadelconsumidor"]].map(([t,h])=>(
            <div key={t} style={{ marginBottom: 8 }}>
              <Link href={h} style={{ color: "#9CA3AF", textDecoration: "none" }} target={h.startsWith("http")?"_blank":undefined}>{t}</Link>
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: 12, lineHeight: 1.6 }}>
            <span style={{ color: "#6B7C6E" }}>Marca registrada · CUIT a confirmar</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, maxWidth: 1100, margin: "0 auto" }}>
        <span>© {new Date().getFullYear()} OficiosYa. Todos los derechos reservados.</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="mailto:contacto@oficiosya.com.ar" style={{ color: "#9CA3AF", textDecoration: "none" }}>contacto@oficiosya.com.ar</Link>
          <Link href="mailto:soporte@oficiosya.com.ar" style={{ color: "#9CA3AF", textDecoration: "none" }}>soporte</Link>
          <Link href="mailto:privacidad@oficiosya.com.ar" style={{ color: "#9CA3AF", textDecoration: "none" }}>privacidad</Link>
        </div>
      </div>
    </footer>
  );
}
