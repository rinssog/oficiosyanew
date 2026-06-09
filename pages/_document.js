/**
 * pages/_document.js
 * HTML base — meta tags PWA para iOS y Android, SEO, Service Worker
 */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es-AR">
      <Head>
        {/* ─── PWA MANIFEST ─────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />

        {/* ─── THEME COLOR ──────────────────────────────────────────── */}
        <meta name="theme-color" content="#0D3B1F" />
        <meta name="background-color" content="#F7F9F5" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ─── iOS ESPECÍFICO ───────────────────────────────────────── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OficiosYa" />
        {/* Apple touch icon PNG */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* ─── SEO BASE ─────────────────────────────────────────────── */}
        <meta name="description" content="Plataforma argentina de servicios y oficios. Prestadores verificados, pago protegido y garantía de 30 días." />
        <meta name="keywords" content="plomero, electricista, cerrajero, pintor, gasista, CABA, Buenos Aires, servicios del hogar, oficio" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OficiosYa" />

        {/* ─── OPEN GRAPH ───────────────────────────────────────────── */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="OficiosYa" />
        <meta property="og:title"       content="OficiosYa — El profesional que necesitás, ya." />
        <meta property="og:description" content="Prestadores verificados, pago protegido y garantía 30 días." />
        <meta property="og:image"       content="/og-image.png" />
        <meta property="og:url"         content="https://oficiosya.com.ar" />
        <meta property="og:locale"      content="es_AR" />

        {/* ─── TWITTER CARD ─────────────────────────────────────────── */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="OficiosYa" />
        <meta name="twitter:description" content="Prestadores verificados, pago protegido y garantía 30 días." />
        <meta name="twitter:image"       content="/og-image.png" />

        {/* ─── FAVICON ──────────────────────────────────────────────── */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        {/* ─── FUENTES Google (preconnect + stylesheet) ────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />

        {/* ─── Estilos base críticos ─────────────────────────────────── */}
        <style>{`
          * { -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
          body { touch-action: manipulation; }
          input, textarea, select { font-size: 16px !important; } /* evita zoom en iOS */
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('[SW] Registrado:', reg.scope); })
                .catch(function(err) { console.log('[SW] Error:', err); });
            });
          }
        ` }} />
      </body>
    </Html>
  );
}
